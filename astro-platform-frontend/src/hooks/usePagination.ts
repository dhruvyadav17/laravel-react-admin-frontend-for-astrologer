import { useSearchParams } from "react-router-dom";

type Options = {
  defaultPage?: number;
  defaultSearch?: string;
};

export function usePagination(options: Options = {}) {
  const {
    defaultPage = 1,
    defaultSearch = "",
  } = options;

  const [searchParams, setSearchParams] =
    useSearchParams();

  /* ================= READ FROM URL ================= */

  const page =
    Number(searchParams.get("page")) ||
    defaultPage;

  const search =
    searchParams.get("search") ??
    defaultSearch;

  /* ================= UPDATE PAGE ================= */

  const setPage = (newPage: number) => {
    const params =
      new URLSearchParams(searchParams);

    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }

    setSearchParams(params);
  };

  /* ================= UPDATE SEARCH ================= */

  const setSearch = (value: string) => {
    const params =
      new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }

    // 🔥 Reset page when searching
    params.delete("page");

    setSearchParams(params);
  };

  return {
    page,
    setPage,
    search,
    setSearch,
  };
}
