import type { EndpointBuilder } from "@reduxjs/toolkit/query";

/* ======================================================
   SHARED TYPES
====================================================== */

export type PaginatedMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginatedMeta;
};

type QueryParams = {
  search?: string;
  page?: number;
};

/* ======================================================
   HELPERS
====================================================== */

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const singularize = (value: string) =>
  value.endsWith("s") ? value.slice(0, -1) : value;

/* ======================================================
   ENTERPRISE CRUD BUILDER (AUTO TAG)
====================================================== */

export function createCrudEndpoints<
  T,
  Tag extends string
>(
  builder: EndpointBuilder<any, Tag, any>,
  options: {
    resource: string;
    isPaginated?: boolean;
  }
) {
  const { resource, isPaginated = true } = options;

  const tag = capitalize(resource) as Tag;

  const capitalized = capitalize(resource);
  const singularName = capitalize(singularize(resource));

  return {
    /* ================= GET ================= */

    [`get${capitalized}`]: builder.query<
      PaginatedResponse<T> | T[],
      QueryParams | void
    >({
      query: (params) => ({
        url: `/admin/${resource}`,
        params,
      }),
      transformResponse: (res: any) =>
        isPaginated
          ? {
              data: res.data ?? [],
              meta: res.meta,
            }
          : res.data ?? [],
      providesTags: [{ type: tag, id: "LIST" }],
    }),

    /* ================= CREATE ================= */

    [`create${singularName}`]: builder.mutation<T, Partial<T>>({
      query: (body) => ({
        url: `/admin/${resource}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: tag, id: "LIST" }],
    }),

    /* ================= UPDATE ================= */

    [`update${singularName}`]: builder.mutation<
      T,
      { id: number } & Partial<T>
    >({
      query: ({ id, ...data }) => ({
        url: `/admin/${resource}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: tag, id: "LIST" }],
    }),

    /* ================= DELETE ================= */

    [`delete${singularName}`]: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/${resource}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: tag, id: "LIST" }],
    }),
  };
}
