import { ElementType, Ref, ComponentPropsWithRef } from 'react'

declare global {
  namespace React {
    export type PickRefType<T> = T extends Ref<infer P> ? P : unknown
    export type PickComponentRefType<T extends ElementType> = PickRefType<ComponentPropsWithRef<T>['ref']>
  }
}
