import {
  Base,
  Link,
  LinkTreeType,
  Mesh,
  MeshFullType,
  MeshModuleBaseType,
  MeshPartialChildrenContainerType,
  MeshType,
  Mesh_FullTypeMixin,
  Mesh_PartialTypeMixin,
  Nest,
  NestType,
  SiteElementType,
  SiteMeshType,
  SiteStepScopeType,
  code,
} from '~'
import type { SiteProcessInputType } from '~'

export type MeshParseType = {
  directory: string
  link: LinkTreeType
  path: string
  text: string
  textByLine: Array<string>
}

export type WithPotentiallyPartialChildrenType = {
  children: Array<{ partial: boolean }>
}

export function childrenAreCompleteMesh(
  node: Record<string, unknown>,
): boolean {
  return (
    'children' in node &&
    code.isArray(node.children) &&
    node.children.filter(x => code.isGenericMesh(x) && x.complete)
      .length === node.children.length
  )
}

export function childrenAreMesh(
  node: Record<string, unknown>,
): boolean {
  return (
    'children' in node &&
    code.isArray(node.children) &&
    node.children.filter(x => code.isGenericNest(x)).length === 0
  )
}

export function createElement(
  node: MeshType<Mesh> | NestType<Nest>,
  parent?: SiteElementType,
): SiteElementType {
  return {
    node,
    parent,
  }
}

export function createInput(
  base: Base,
  module: MeshModuleBaseType,
  scope: SiteStepScopeType,
  element: MeshType<Mesh> | NestType<Nest>,
  bindings: Record<string, unknown>,
): SiteProcessInputType {
  return {
    base,
    element: code.createElement(element),
    environment: code.createEnvironment(bindings),
    module,
    scope,
  }
}

export function createTerm(name: string): MeshFullType<Mesh.Term> {
  return {
    complete: true,
    dive: false,
    like: Mesh.Term,
    name,
    nest: [],
    partial: false,
  }
}

export function getNestedProperty(
  object: Record<string, unknown>,
  path: Array<string>,
): unknown {
  let value: unknown = object
  path.forEach(part => {
    if (code.isRecord(value)) {
      value = value[part]
    } else {
      value = undefined
    }
  })
  return value
}

export function getProperty(
  object: Record<string, unknown>,
  path: string,
): unknown {
  if (code.isRecord(object) && path in object) {
    return object[path]
  }
}

export function loadLinkModule(
  base: Base,
  path: string,
): MeshParseType {
  const text = code.readTextFile(base, path)
  const data = code.parseLinkText({ path, text })
  const directory = code.getLinkHost(path)
  return {
    directory,
    ...data,
  }
}

export function processNestedChildren(
  input: SiteProcessInputType,
  nest: LinkTreeType,
  cb: (input: SiteProcessInputType) => void,
): void {
  nest.nest.forEach((nest, index) => {
    cb(
      code.withEnvironment(input, {
        index,
        nest,
      }),
    )
  })
}

export function replaceIfComplete(
  input: SiteProcessInputType,
  child: MeshPartialChildrenContainerType,
  cb: () => void,
): void {
  if (code.childrenAreMesh(child)) {
    code.potentiallyReplaceWithFullNode(input, cb)
  }
}

export function replaceSeed<T extends MeshModuleBaseType>(
  input: SiteProcessInputType,
  replacement: T,
): void {
  input.module = replacement
  input.module.base.card(input.module.path).bind(replacement)
}

export function resolveHashtagAsNumber(
  input: SiteProcessInputType,
): number | undefined {
  let hashtag = code.assumeLink(input, Link.Hashtag)

  switch (hashtag.system) {
    case 'b':
      return parseInt(hashtag.code, 2)
    case 'x':
      return parseInt(hashtag.code, 16)
    case 'o':
      return parseInt(hashtag.code, 8)
    case 'h':
      return parseInt(hashtag.code, 16)
    case 'd':
      return parseInt(hashtag.code, 10)
    case 's':
      return parseInt(hashtag.code, 60)
    case 't':
      return parseInt(hashtag.code, 12)
    default:
      // this is caught earlier
      code.throwError(code.generateInvalidCompilerStateError())
  }
}

export function withElement(
  input: SiteProcessInputType,
  element: MeshType<Mesh> | NestType<Nest>,
): SiteProcessInputType {
  return {
    ...input,
    element: code.createElement(element, input.element),
  }
}

export function withEnvironment(
  input: SiteProcessInputType,
  bindings: Record<string, unknown>,
): SiteProcessInputType {
  return {
    ...input,
    environment: code.createEnvironment(bindings, input.environment),
  }
}

export function withScope(
  input: SiteProcessInputType,
  scope: SiteStepScopeType,
): SiteProcessInputType {
  return {
    ...input,
    scope,
  }
}
