export type TournoiSummary = {
  id: string;
  nom: string;
  date: Date;
  description: string | null;
  estTermine: boolean;
  nbEquipes: number;
  nbMatchs: number;
  nbJoueursInscrits: number;
};

export type TournoiDetails = {
  id: string;
  nom: string;
  date: Date;
  description: string | null;
  estTermine: boolean;
  matchs: MatchSummary[];
  joueursInscrits: JoueurSummary[];
};

export type JoueurSummary = {
  id: string;
  prenom: string;
  nom: string;
};

export type EquipeSummary = {
  id: string;
  nom: string;
  joueurs: JoueurSummary[];
};

export type MatchSummary = {
  id: string;
  equipeA: EquipeSummary;
  equipeB: EquipeSummary;
  scoreA: number;
  scoreB: number;
};
