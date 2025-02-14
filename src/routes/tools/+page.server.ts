import type { Crumb } from "svelte-breadcrumbs";
import type { PageServerLoad } from "./$types";
export type MyCrumbMetadata = {
    altRoutes: Crumb[];
};

export const load: PageServerLoad = async ({ locals, url }) => {
    const crumbs: Crumb<MyCrumbMetadata>[] = [
      {
        title: "Tools",
        url: "./tools",
        metadata: {
          altRoutes: [{
            title: "Blog",
            url: "./blog"
          }],
        },
      },
      {
        title: "Pacenotes Translator",
        url: "./tools/pacenotes-translator",
        metadata: {
          altRoutes: [{
            title: "Codriver Installer",
            url: "./blog/post/pilot-rajdowy-richard-burns-rally"
          }],
        },
      }
    ];
    return {
      crumbs,
    };
  };