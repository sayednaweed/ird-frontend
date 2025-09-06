export const StatusEnum = {
  active: 1,
  block: 2,
  pending: 3,
  rejected: 4,
  document_upload_required: 5,
  expired: 6,
  extended: 7,
  approved: 8,
  registered: 9,

  // organization
  registration_incomplete: 10,

  // Project
  pending_for_schedule: 11,
  has_comment: 12,
  scheduled: 13,
};

export const ChecklistEnum = {
  user: 1,
  director_nid: 2,
  director_work_permit: 3,
  organization_representor_letter: 4,
  ministry_of_economy_work_permit: 5,
  articles_of_association: 6,
  organization_register_form_en: 8,
  organization_register_form_ps: 9,
  organization_register_form_fa: 10,

  // project checklist
  moe_project_introduction_letter: 11, // Project introduction letter from Ministry of Economy
  project_articles_of_association: 12,
  project_presentation: 13, // Project Presentation
  organization_and_donor_contract: 14, // organization & Donor Contract Letter
  mou_en: 15, // Memorandum of Understanding (English)
  mou_fa: 16, // Memorandum of Understanding (Farsi)
  mou_ps: 17,
  project_ministry_of_economy_work_permit: 18,

  // Schedule
  schedule_deputy_document: 19,
};

export const TaskTypeEnum = {
  organization_registeration: 1,
  project_registeration: 2,
  organization_agreement_extend: 3,
  project_extend: 4,
  scheduling: 5,
};
export const NotifierEnum = {
  confirm_adding_user: 1,
};
export const ApprovalTypeEnum = {
  approved: 1,
  pending: 2,
  rejected: 3,
};
export const AboutStaffEnum = {
  manager: 1,
  director: 2,
  technical_support: 3,
};
// Application
export const RoleEnum = {
  super: 1,
  debugger: 2,
  administrator: 3,
  organization: 4,
  donor: 5,
};
export const PermissionEnum = {
  dashboard: { name: "dashboard", sub: {} },
  settings: {
    name: "settings",
    sub: {},
  },
  logs: { id: 1, name: "logs", sub: {} },
  reports: { id: 2, name: "reports", sub: {} },
  configurations: {
    id: 3,
    name: "configurations",
    sub: {
      configurations_job: 31,
      configurations_checklist: 32,
      configurations_division: 33,
      configurations_role: 34,
      configurations_application: 35,
      configurations_faqs: 35,
    },
  },
  users: {
    id: 4,
    name: "users",
    sub: {
      user_information: 1,
      user_password: 2,
      account_status: 3,
    },
  },
  audit: { id: 5, name: "audit", sub: {} },
  about: {
    id: 6,
    name: "about",
    sub: {
      director: 91,
      manager: 92,
      office: 93,
      technical_sup: 94,
      slideshow: 95,
      faqs: 96,
      faqs_type: 97,
      news: 98,
      news_type: 99,
    },
  },
  approval: {
    id: 7,
    name: "approval",
    sub: {
      user: 51,
      organization: 52,
      donor: 53,
    },
  },
  activity: {
    id: 8,
    name: "activity",
    sub: {
      user_activity: 71,
    },
  },
  // App
  organization: {
    id: 9,
    name: "organizations",
    sub: {
      information: 62,
      director_information: 63,
      agreement: 64,
      agreement_status: 65,
      more_information: 66,
      status: 67,
      representative: 68,
      account_password: 69,
    },
  },
  projects: {
    id: 10,
    name: "projects",
    sub: {
      detail: 121,
      center_budget: 122,
      organ_structure: 123,
      checklist: 124,
    },
  },
  donor: {
    id: 11,
    name: "donors",
    sub: {
      information: 141,
      status: 142,
    },
  },
  schedules: {
    id: 12,
    name: "schedules",
    sub: {},
  },
};
// Application
export const CountryEnum = {
  afghanistan: 2,
};
export const CheckListTypeEnum = {
  user: 1,
  organization_registeration: 2,
  project_registeration: 3,
  organization_agreement_extend: 4,
  project_extend: 5,
  scheduling: 6,
};
export const ApplicationEnum = {
  user_approval: 1,
  organization_registeration_valid_time: 2,
};
