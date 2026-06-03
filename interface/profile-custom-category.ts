export interface UpsertProfileCustomCategorySetRequest {
  id?: string | null;
  name: string;
  categories: UpsertProfileCustomCategoryRequest[];
}

export interface UpsertProfileCustomCategoryRequest {
  id?: string | null;
  name: string;
  colorSet: string;
  iconName: string;
  pfcPrimaries: UpsertProfileCustomCategoryPfcPrimaryRequest[];
}

export interface UpsertProfileCustomCategoryPfcPrimaryRequest {
  pfcPrimaryCode: string;
  pfcVersion: string;
}

export interface ProfileCustomCategorySetResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  categories: ProfileCustomCategoryResponse[];
}

export interface ProfileCustomCategoryResponse {
  id: string;
  name: string;
  colorSet: string;
  iconName: string;
  pfcPrimaries: ProfileCustomCategoryPfcPrimaryResponse[];
}

export interface ProfileCustomCategoryPfcPrimaryResponse {
  id: string;
  pfcPrimaryCode: string;
  pfcVersion: string;
}
