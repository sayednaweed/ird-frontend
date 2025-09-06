import type {
  BasicModel,
  SubPermission,
  UserPermission,
} from "@/database/models";

export type Configuration = {
  token?: string;
  type?: string;
  language?: string;
};
export interface FileType {
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
}
export type Order = "desc" | "asc";
export interface PaginationData<T> {
  data: T[];
  lastPage: number;
  perPage: number;
  currentPage: number;
  totalItems: number;
}
export type UserSort =
  | "created_at"
  | "username"
  | "destination"
  | "status"
  | "job";
export type UserSearch = "username" | "contact" | "email";
export interface UserRecordCount {
  activeUserCount: number | null;
  inActiveUserCount: number | null;
  todayCount: number | null;
  userCount: number | null;
}
export type UserAction = "add" | "delete" | "edit" | "view" | "singleRow";
export type IUserPermission = {
  id: number;
  edit: boolean;
  view: boolean;
  delete: boolean;
  add: boolean;
  visible: boolean;
  permission: string;
  icon: string;
  priority: number;
  sub: SubPermission[];
  allSelected: boolean;
};
export type SelectUserPermission = UserPermission & {
  allSelected: boolean;
};
export interface UserInformation {
  profile: any;
  imagePreviewUrl: any;
  full_name: string;
  username: string;
  password: string;
  status_id?: number;
  status?: string;
  email: string;
  job: {
    id: string;
    name: string;
    selected: boolean;
  };
  role: {
    id: string;
    name: string;
    selected: boolean;
  };
  contact: string;
  division: {
    id: string;
    name: string;
    selected: boolean;
  };
  permission: Map<string, SelectUserPermission>;
  allSelected: boolean;
  created_at: string;
}
export interface UserPassword {
  old_password?: string;
  new_password: string;
  confirm_password: string;
}
export type OrganizationInformation = {
  id: string;
  profile: string | undefined;
  name: string;
  abbr: string;
  status_id: number;
  status: string;
  registration_no: string;
  type_id: string;
  type: string;
  email: string;
  contact: string;
  username: string;
  created_at: string;
};
export type DonorInformation = {
  id: string;
  name: string;
  abbr: string;
  profile: string | undefined;
  username: string;
  email: string;
  contact: string;
  created_at: string;
};
export type EditDonorInformation = {
  id: string;
  profile: string | undefined;
  name_english: string | undefined;
  name_pashto: string;
  name_farsi: string;
  username: string;
  area_english: string;
  area_pashto: string;
  area_farsi: string;
  abbr: string;
  contact: string;
  email: string;
  province: BasicModel;
  district: BasicModel;
  created_at: string;
  optional_lang: string;
};
export type ProjectHeaderType = {
  name: string;
  status_id: number;
  status: string;
  registration_no: string;
};
export type ProjectOrganizationStructureType = {
  pro_manager_name_english: string;
  pro_manager_name_farsi: string;
  pro_manager_name_pashto: string;
  pro_manager_contact: string;
  pro_manager_email: string;
  previous_manager: boolean;
  manager: { id: string; name: string } | undefined;
};
export interface Option {
  name: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}
export type ActivitySearch = "user" | "type";
export type ApprovalSearch = "requester" | "id";
export type ErrorLogSort = "uri" | "method" | "created_at";
export type ErrorLogSearch =
  | "uri"
  | "error_code"
  | "ip_address"
  | "exception_type";

export type AuditSearch = "user" | "event";

// application
export type OrganizationSort = "id" | "name" | "type" | "contact" | "status";
export type OrganizationSearch =
  | "id"
  | "abbr"
  | "registration_no"
  | "name"
  | "type"
  | "contact";
export type DonorSearch = "id" | "abbr" | "name" | "username" | "contact";
export type DonorSort = "id" | "name" | "contact" | "status";
export type NewsSort =
  | "id"
  | "type"
  | "priority"
  | "visible"
  | "visibility_date"
  | "date";
export type NewsSearch = "title";
export type ProjectSort =
  | "registration_no"
  | "project_name"
  | "donor"
  | "status"
  | "currency";
export type ProjectSearch =
  | "registration_no"
  | "project_name"
  | "donor"
  | "budget";
