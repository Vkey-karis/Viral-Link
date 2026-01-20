import { SavedProject, ProductData, AdCopyPackage, VideoScript } from '../types';

const STORAGE_KEY = 'virallink_projects_v1';

export const saveProject = (
  productData: ProductData,
  adCopy: AdCopyPackage,
  script: VideoScript
): SavedProject => {
  const projects = getProjects();
  
  const newProject: SavedProject = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    productData,
    adCopy,
    script
  };

  // Add to beginning of array
  const updatedProjects = [newProject, ...projects];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  } catch (e) {
    console.error("LocalStorage Limit Reached", e);
    throw new Error("Storage full. Please delete old projects to save new ones.");
  }

  return newProject;
};

export const getProjects = (): SavedProject[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load projects", e);
    return [];
  }
};

export const deleteProject = (id: string): SavedProject[] => {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};
