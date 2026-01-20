import React, { useEffect, useState } from 'react';
import { SavedProject } from '../types';
import { getProjects, deleteProject } from '../services/storageService';
import { Trash2, FolderOpen, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';

interface Props {
  onLoadProject: (project: SavedProject) => void;
  onBack: () => void;
}

const ProjectHistory: React.FC<Props> = ({ onLoadProject, onBack }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updated = deleteProject(id);
      setProjects(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Project History</h2>
          <p className="text-slate-400">Access and manage your previously generated campaigns.</p>
        </div>
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white font-medium transition-colors"
        >
          Back to Creator
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
          <FolderOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-500 mb-2">No Saved Projects</h3>
          <p className="text-slate-600 mb-6">Generate your first viral campaign to see it here.</p>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
          >
            Start New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onLoadProject(project)}
              className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button 
                   onClick={(e) => handleDelete(project.id, e)}
                   className="p-2 bg-slate-950/80 text-red-400 hover:text-red-300 rounded-lg backdrop-blur-sm transition-colors"
                   title="Delete Project"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {project.productData.marketplace}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-lg line-clamp-1 mb-1">{project.productData.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{project.adCopy.shortCopy}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                    Open Project <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectHistory;
