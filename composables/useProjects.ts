import { requireNumber } from "./helpers";
import { type RouteParams } from "vue-router";

export const useProjects = async (params: RouteParams) => {
  const { hasRoles, refreshUser, loading, projects } = await useUser();
  const project = computed(() => getProjectFromParams(params));

  const getProjectById = (
    projectId: number | string | undefined | null | string[],
  ): FullProject | undefined => {
    projectId = requireNumber(projectId, 'projectId')

    const result = projects.value.find(p => p.id === projectId);
    return result;
  }

  const createProject = async (
    name: string, fields: NewProjectField[]
  ): Promise<FullProject> => {
    return $fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, fields }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async (response) => {
      await refreshUser();
      return response;
    })
  };

  const addCollaborator = async (
    projectId: number,
    email: string,
  ): Promise<any> => {
    return fetch(
      `/api/projects/${projectId}/collaborators`,
      {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  };


  const sortFields = (project: FullProject) => [...project.fields].sort(
    (a, b) => a.index > b.index ? 1 : -1
  );

  const hasOwnership = (
    projectId: number | string,
    projects: FullProject[]
  ): boolean => {
    projectId = requireNumber(projectId, 'projectId')
    if (!projects.length) {
      return false;
    }
    const ownedIds = projects.map(p => p.id);
    const ownsProject = !!ownedIds.find(id => id === projectId);
    return ownsProject;
  }

  const getProjectFromParams = (params: RouteParams): FullProject | undefined => {
    try {
      const p = getProjectById(params?.projectId);
      return p;
    } catch {
      return undefined;
    }
  }

  const deleteParameter = async (projectId: number, field: { id: number }) => {
    return fetch(
      `/api/projects/${projectId}/fields/${field.id}`,
      {
        method: 'DELETE',
      }
    )
  }

  const createParameter = async (
    projectId: number,
    field: NewProjectField
  ) => {
    return fetch(
      `/api/projects/${projectId}/fields`,
      {
        method: 'POST',
        body: JSON.stringify(field),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  const isOwner = computed(() =>
    project.value?.id && hasRoles(project.value.id, ['OWNER']),
  );


  return {
    projects,
    createProject,
    loading,
    hasOwnership,
    getProjectById,
    addCollaborator,
    deleteParameter,
    sortFields,
    createParameter,
    project,
    isOwner,
  };
};