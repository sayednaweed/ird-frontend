import type { FileType } from "@/lib/types";
import type { DateObject } from "react-multi-date-picker";

export type Role =
  | { role: 1; name: "super" }
  | { role: 2; name: "debugger" }
  | { role: 3; name: "administrator" }
  | { role: 4; name: "organization" }
  | { role: 5; name: "donor" };

export interface SubPermission {
  id: number;
  name: string;
  is_category: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
  add: boolean;
}
export type UserPermission = {
  id: number;
  edit: boolean;
  view: boolean;
  delete: boolean;
  add: boolean;
  visible: boolean;
  permission: string;
  icon: string;
  priority: number;
  sub: Map<number, SubPermission>;
};
export type User = {
  id: string;
  registration_number: string;
  full_name: string;
  username: string;
  email: string;
  status?: string;
  status_id?: number;
  profile: any;
  role: Role;
  contact: string;
  job: string;
  division: string;
  permissions: Map<string, UserPermission>;
  created_at: string;
  gender: string;
};
export type Notification = {
  id: string;
  message: string;
  notifier_id: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
};
export type Staff = {
  picture: string;
  name: string;
  job: string;
  contact: string;
  email: string;
  id: string;
};
export interface BasicModel {
  id: number;
  name: string;
  created_at: string;
}
export interface FAQ {
  id: number;
  question: string;
  order?: number;
  type: string;
  answer?: string;
  created_at: string;
}
export type CheckList = {
  id: string;
  type: string;
  type_id: number;
  name: string;
  acceptable_extensions: string;
  active: number;
  file_size: number;
  acceptable_mimes: string;
  accept: string;
  description: string;
  saved_by: string;
  created_at: string;
};
export interface IStaffSingle {
  name_english: string;
  name_farsi: string;
  name_pashto: string;
  contact: string;
  email: string;
  id: string;
  picture: File | undefined | string;
  optional_lang: string;
  imageUrl: string;
  editable: boolean;
}
export interface Slideshow {
  id: string;
  title: string;
  description: string;
  image: undefined | string;
  date: string;
  visible: number;
  saved_by?: string;
}

export type BasicStatus = {
  id: number;
  name: string;
  is_active: number;
  saved_by: string;
  comment: string;
  status_id: number;
  created_at: string;
};
export interface ActivityModel {
  id: string;
  profile: string;
  username: string;
  userable_type: string;
  action: string;
  ip_address: string;
  platform: string;
  browser: string;
  date: string;
}
export interface Approval {
  id: string;
  request_comment: string;
  request_date: string;
  respond_comment: string;
  respond_date: string;
  approval_type_id: string;
  approval_type: string;
  requester_id: string;
  requester: string;
  responder_id: string;
  responder_name: string;
  notifier_type_id: number;
  notifier_type: string;
  document_count: string;
  completed: boolean;
}
export interface ApprovalDocument extends FileType {
  document_id: string;
  checklist_id: string;
  checklist_name: string;
  acceptable_extensions: string;
  acceptable_mimes: string;
  description: string;
}
export interface IApproval {
  id: string;
  requester_id: string;
  requester_name: string;
  request_date: string;
  start_date: string;
  end_date: string;
  request_comment: string;
  responder_id?: string;
  responder?: string;
  respond_date?: string;
  respond_comment?: string;
  notifier_type_id: number;
  notifier_type: string;
  approval_documents: ApprovalDocument[];
  completed: boolean;
}
export interface Applications {
  id: number;
  cast_to: string;
  value: string;
  description: string;
  name: string;
}
export interface ErrorLog {
  id: string;
  created_at: string;
  error_message: string;
  username: string;
  user_id: number | string;
  ip_address: string;
  method: string;
  exception_type: string;
  error_code: string;
  uri: string;
  trace: string;
}
export type Audit = {
  id: string;
  username: string;
  user_id: string;
  user_type: string;
  event: string;
  table: string;
  auditable_id: string;
  old_values: any;
  new_values: any;
  url: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
};
// Application
export type Agreement = {
  id: string;
  start_date: string;
  end_date: string;
};
export interface AgreementDocument extends FileType {
  document_id: string;
  checklist_id: string;
  checklist_name: string;
  acceptable_extensions: string;
  acceptable_mimes: string;
  description: string;
  file_size: number;
}
export interface Director {
  id: string;
  is_active: boolean;
  name: string;
  surname: string;
  contact: string;
  email: string;
}
export interface OrganizationDirector {
  name_english: string;
  name_pashto: string;
  name_farsi: string;
  surname_english: string;
  surname_pashto: string;
  surname_farsi: string;
  contact: string;
  email: string;
  gender: BasicModel | undefined;
  moe_registration_no: string;
  nationality: BasicModel | undefined;
  nid: string;
  identity_type: BasicModel | undefined;
  province: BasicModel | undefined;
  district: BasicModel | undefined;
  establishment_date: DateObject | undefined;
  is_active: boolean;
  area_english?: string;
  area_farsi?: string;
  area_pashto?: string;
  optional_lang: string;
}
export interface Representor {
  id: string;
  is_active: boolean;
  created_at: string;
  full_name: string;
  saved_by: string;
  userable_id: string;
  userable_type: string;
  agreement_id: string;
  agreement_no: string;
  start_date: string | null;
  end_date: string | null;
}

export type OrganizationStatus = {
  id: string;
  organization_id: string;
  status_type_id: number;
  is_active: number;
  name: string;
  userable_type: string;
  comment: string;
  created_at: string;
};
export interface OrganizationRepresentor {
  repre_name_english: string;
  repre_name_farsi: string;
  repre_name_pashto: string;
  letter_of_intro: any;
  is_active: boolean;
  optional_lang: string;
  checklist: CheckList;
}
export type Organization = {
  id: string;
  profile: string | undefined;
  name: string;
  username: string;
  status_id: number;
  agreement_status_id: number;
  agreement_status: string;
  email: string;
  contact: string;
  is_editable: boolean;
  role: Role;
  permissions: Map<string, UserPermission>;
  created_at: string;
};
export type Donor = {
  id: string;
  profile?: string;
  name: string;
  username: string;
  status: string;
  email: string;
  contact: string;
  is_editable: boolean;
  role: Role;
  permissions: Map<string, UserPermission>;
  created_at: string;
};
export type DonorStatus = {
  id: string;
  donor_id: string;
  status_id: number;
  is_active: number;
  name?: string;
  username: string;
  comment: string;
  created_at: string;
};
export type News = {
  id: string;
  title: string;
  contents: string;
  image: string;
  news_type: string;
  news_type_id: number;
  priority: string;
  priority_id: number;
  user: string;
  visible: boolean;
  visibility_date: string;
  date: string;
  created_at: string;
};
export type Projects = {
  id: string;
  project_name: string;
  donor: string;
  budget: number;
  currency: number;
  start_date: string;
  end_date: string;
  status: string;
  status_id: number;
  created_at: string;
};
export interface CenterBudget {
  id: string;
  province: { id: string; name: string };
  district: { id: string; name: string }[];
  villages: {
    id: string;
    village_english: string;
    village_farsi: string;
    village_pashto: string;
  }[];
  selectedDistrictId: string;
  health_centers_english: string;
  health_centers_pashto: string;
  health_centers_farsi: string;
  budget: number;
  direct_benefi: string;
  in_direct_benefi: string;
  address_english: string;
  address_pashto: string;
  address_farsi: string;
  health_worker_english: string;
  health_worker_pashto: string;
  health_worker_farsi: string;
  fin_admin_employees_english: string;
  fin_admin_employees_pashto: string;
  fin_admin_employees_farsi: string;
}
export type ProjectManager = {
  id: string;
  ngo_id: string;
  full_name: number;
  email: string;
  contact: string;
  is_active: boolean;
  created_at: string;
};
export type ProjectStatus = {
  id: string;
  project_id: string;
  status_type_id: number;
  is_active: number;
  name: string;
  userable_type: string;
  comment: string;
  created_at: string;
};
export type ProjectDetailType = {
  project_name_english: string;
  project_name_farsi: string;
  project_name_pashto: string;
  preamble_english: string;
  preamble_farsi: string;
  preamble_pashto: string;
  abbreviat_english: string;
  abbreviat_farsi: string;
  abbreviat_pashto: string;
  organization_sen_man_english: string;
  organization_sen_man_farsi: string;
  organization_sen_man_pashto: string;
  exper_in_health_english: string;
  exper_in_health_farsi: string;
  exper_in_health_pashto: string;
  project_intro_english: string;
  project_intro_farsi: string;
  project_intro_pashto: string;
  goals_english: string;
  goals_farsi: string;
  goals_pashto: string;
  objective_english: string;
  objective_farsi: string;
  objective_pashto: string;
  expected_outcome_english: string;
  expected_outcome_farsi: string;
  expected_outcome_pashto: string;
  expected_impact_english: string;
  expected_impact_farsi: string;
  expected_impact_pashto: string;
  main_activities_english: string;
  main_activities_farsi: string;
  main_activities_pashto: string;
  action_plan_english: string;
  action_plan_farsi: string;
  action_plan_pashto: string;
};
export type Schedules = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  representators_count: number;
  presentation_lenght: number;
  gap_between: number;
  lunch_start: string;
  lunch_end: string;
  dinner_start: string;
  dinner_end: string;
  presentation_before_lunch: number;
  presentation_after_lunch: number;
  is_hour_24: number;
  status: string;
  schedule_status_id: number;
};
export interface Project {
  id: number;
  name: string;
  attachment?: FileType;
  selected: boolean;
}
export interface TimeSlot {
  id: number;
  presentation_start: string;
  presentation_end: string;
  gap_end: string;
}

export interface FixedBreak {
  start: string; // e.g., "12:30"
  end: string; // e.g., "13:30"
}

export interface ScheduleItem {
  slot: TimeSlot;
  attachment?: FileType;
  projectId: number | null;
  project_name: string | undefined;
}
export type Schedule = {
  id?: string;
  date: DateObject;
  presentation_count: number;
  projects: Project[];
  scheduleItems: ScheduleItem[];
  start_time: string;
  end_time: string;
  is_hour_24: boolean;
  presentation_length: number;
  gap_between: number;
  lunch_start: string;
  lunch_end: string;
  dinner_start: string;
  dinner_end: string;
  presentations_before_lunch: number;
  presentations_after_lunch: number;
  validation_checklist: any;
  special_projects: {
    project: { id: number; name: string };
    attachment: FileType;
  }[];
};
