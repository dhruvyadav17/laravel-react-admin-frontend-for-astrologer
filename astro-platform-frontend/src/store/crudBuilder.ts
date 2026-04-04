// PATH: src/store/crudBuilder.ts
// FIX BUG-19: tag = capitalize(resource) → "users" → "Users"
//              baseApi tagTypes mein: "User", "Role", "Permission" (singular)
//              Mismatch hone se RTK Query cache invalidation kaam nahi karta tha
//              User create/update karo → list refresh nahi hoti thi
//
//              FIX: tag = singularName → "User", "Role", "Permission" (matches baseApi)
//
// IMPROVEMENT: TypeScript types improve kiye — any se proper generics

import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export type PaginatedMeta = {
  current_page: number;
  last_page:    number;
  per_page:     number;
  total:        number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginatedMeta;
};

type QueryParams = {
  search?: string;
  page?:   number;
};

/* ── Helpers ─────────────────────────────────────── */
const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const singularize = (value: string) =>
  value.endsWith("s") ? value.slice(0, -1) : value;

/* ── CRUD Builder ────────────────────────────────── */
export function createCrudEndpoints<T, Tag extends string>(
  builder: EndpointBuilder<any, Tag, any>,
  options: {
    resource:     string;
    isPaginated?: boolean;
  }
) {
  const { resource, isPaginated = true } = options;

  const singularName = capitalize(singularize(resource));  // "users" → "User"
  const capitalized  = capitalize(resource);               // "users" → "Users"

  // FIX BUG-19: tag was capitalize(resource) = "Users"
  //             Now: singularName = "User" → matches baseApi tagTypes
  const tag = singularName as Tag;

  return {

    /* ── GET list ───────────────────────────────── */
    [`get${capitalized}`]: builder.query<
      PaginatedResponse<T> | T[],
      QueryParams | void
    >({
      query: (params) => ({ url: `/admin/${resource}`, params }),
      transformResponse: (res: any) =>
        isPaginated
          ? { data: res.data ?? [], meta: res.meta }
          : res.data ?? [],
      providesTags: [{ type: tag, id: "LIST" }],  // FIX: "User" not "Users"
    }),

    /* ── CREATE ─────────────────────────────────── */
    [`create${singularName}`]: builder.mutation<T, Partial<T>>({
      query: (body) => ({
        url:    `/admin/${resource}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: tag, id: "LIST" }],
    }),

    /* ── UPDATE ─────────────────────────────────── */
    [`update${singularName}`]: builder.mutation<
      T,
      { id: number } & Partial<T>
    >({
      query: ({ id, ...data }) => ({
        url:    `/admin/${resource}/${id}`,
        method: "PUT",
        body:   data,
      }),
      invalidatesTags: [{ type: tag, id: "LIST" }],
    }),

    /* ── DELETE ─────────────────────────────────── */
    [`delete${singularName}`]: builder.mutation<void, number>({
      query: (id) => ({
        url:    `/admin/${resource}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: tag, id: "LIST" }],
    }),
  };
}
