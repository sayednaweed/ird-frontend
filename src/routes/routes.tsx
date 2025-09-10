import type {
  Donor,
  Organization,
  User,
  UserPermission,
} from "@/database/models";
import ProtectedRoute from "@/routes/protected-route";
import AuthLayout from "@/views/layouts/auth-layout";
import GuestLayout from "@/views/layouts/guest-layout";
import SiteLayout from "@/views/layouts/site-layout";
import LoginPage from "@/views/pages/guest-features/login/user/login-page";
import UserLoginPage from "@/views/pages/guest-features/login/user/user-login-page";
import MainPage from "@/views/pages/main-site/main/main-page";
import { Route, Routes } from "react-router";
import { lazy } from "react";
import UnProtectedRoute from "@/routes/unprotected-route";
import AuthenticatedRoute from "@/routes/authenticated-route";
import OrganizationPage from "@/views/pages/auth-features/organization/organization-page";
import OrganizationEditPage from "@/views/pages/auth-features/organization/edit/organization-edit-page";
import OrganizationFormExtend from "@/views/pages/auth-features/organization/form-extend/organization-form-extend";
import OrganizationFormSubmit from "@/views/pages/auth-features/organization/form-submit/organizationPage-form-submit";
import { RoleEnum } from "@/database/model-enums";
import DonorPage from "@/views/pages/auth-features/donor/donor-page";
import DonorEditPage from "@/views/pages/auth-features/donor/edit/donor-edit-page";
import EditNews from "@/views/pages/auth-features/about/tabs/news/edit/edite-news";
import OrganizationProtectedRoute from "@/routes/organization-protected-route";
import AddProject from "@/views/pages/auth-features/projects/add/add-project";
import ProjectEditPage from "@/views/pages/auth-features/projects/edit/project-edit-page";
import ProjectsPage from "@/views/pages/auth-features/projects/projects-page";
import SchedulesPage from "@/views/pages/auth-features/schedules/schedules-page";
import AddOrEditSchedule from "@/views/pages/auth-features/schedules/add-or-edit-schedule";
import { ScheduleView } from "@/views/pages/auth-features/schedules/tabs/parts/start-presentation";
import SuperDashboardPage from "@/views/pages/auth-features/dashboard/super/super-dashboard-page";

const UsersProfilePage = lazy(
  () => import("@/views/pages/auth-features/profile/users/users-profile-page")
);
const AboutPage = lazy(
  () => import("@/views/pages/auth-features/about/about-page")
);
const ConfigurationsPage = lazy(
  () => import("@/views/pages/auth-features/configurations/configurations-page")
);
const SettingsPage = lazy(
  () => import("@/views/pages/auth-features/settings/settings-page")
);
const ActivityPage = lazy(
  () => import("@/views/pages/auth-features/activity/activity-page")
);
const UserPage = lazy(
  () => import("@/views/pages/auth-features/users/user-page")
);
const UserEditPage = lazy(
  () => import("@/views/pages/auth-features/users/edit/user-edit-page")
);
const ApprovalPage = lazy(
  () => import("@/views/pages/auth-features/approval/approval-page")
);
const HomePage = lazy(() => import("@/views/pages/main-site/home/home-page"));
const FaqsPage = lazy(() => import("@/views/pages/main-site/faq/Faqs-page"));
const ContactUsPage = lazy(
  () => import("@/views/pages/main-site/contact-us/contact-us-page")
);
const AboutUsPage = lazy(
  () => import("@/views/pages/main-site/about-us/about-us-page")
);
const AuditPage = lazy(
  () => import("@/views/pages/auth-features/audit/audit-page")
);
const LogsPage = lazy(
  () => import("@/views/pages/auth-features/log/logs-page")
);
const NewsPage = lazy(() => import("@/views/pages/main-site/news/news-page"));
export const getAuthRouter = (
  user: User | Donor | Organization,
  authenticated: boolean
) => {
  const permissions: Map<string, UserPermission> = user.permissions;
  return (
    <Routes>
      {/* Super Routes (Protected) */}
      <Route path="/dashboard" element={<AuthLayout />}>
        <Route
          index
          element={
            <AuthenticatedRoute
              element={<SuperDashboardPage />}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute
              element={<UserPage />}
              routeName="users"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="users/:id"
          element={
            <ProtectedRoute
              element={<UserEditPage />}
              routeName="users"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="configurations/:id"
          element={
            <ProtectedRoute
              element={<ConfigurationsPage />}
              routeName="configurations"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="about/:id"
          element={
            <ProtectedRoute
              element={<AboutPage />}
              routeName="about"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="activity/:id"
          element={
            <ProtectedRoute
              element={<ActivityPage />}
              routeName="activity"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="approval"
          element={
            <ProtectedRoute
              element={<ApprovalPage />}
              routeName="approval"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="settings"
          element={
            <AuthenticatedRoute
              element={<SettingsPage />}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="profile"
          element={
            <AuthenticatedRoute
              element={<UsersProfilePage />}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="logs"
          element={
            <ProtectedRoute
              element={<LogsPage />}
              routeName="logs"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="audit"
          element={
            <ProtectedRoute
              element={<AuditPage />}
              routeName="audit"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        {/* App */}
        <Route
          path="organizations"
          element={
            <ProtectedRoute
              element={<OrganizationPage />}
              routeName="organizations"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="organizations/:id"
          element={
            <ProtectedRoute
              element={<OrganizationEditPage />}
              routeName="organizations"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="organization/profile/edit/:id"
          element={
            <OrganizationProtectedRoute
              element={<OrganizationFormSubmit />}
              authenticated={authenticated}
              user={user}
            />
          }
        />
        <Route
          path="organizations/register/extend/:id"
          element={
            <ProtectedRoute
              element={<OrganizationFormExtend />}
              routeName="organizations"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="donors"
          element={
            <ProtectedRoute
              element={<DonorPage />}
              routeName="donors"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="donors/:id"
          element={
            <ProtectedRoute
              element={<DonorEditPage />}
              routeName="donors"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="about/news/:id"
          element={
            <ProtectedRoute
              element={<EditNews />}
              routeName="about"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute
              element={<ProjectsPage />}
              routeName="projects"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="projects/:id"
          element={
            <ProtectedRoute
              element={<AddProject />}
              routeName="projects"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="projects/details/:id"
          element={
            <ProtectedRoute
              element={<ProjectEditPage />}
              routeName="projects"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="schedules"
          element={
            <ProtectedRoute
              element={<SchedulesPage />}
              routeName="schedules"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="schedules/start/presentation/:id"
          element={
            <ProtectedRoute
              element={<ScheduleView />}
              routeName="schedules"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="schedules/:data/*"
          element={
            <ProtectedRoute
              element={<AddOrEditSchedule />}
              routeName="schedules"
              permissions={permissions}
              authenticated={authenticated}
            />
          }
        />
      </Route>
      {/* Site Routes */}
      <Route path="/" element={<SiteLayout />}>
        {/* These routes will be passed as children */}
        {site}
      </Route>
      <Route path="/" element={<GuestLayout />}>
        <Route
          path="/login"
          element={
            <UnProtectedRoute
              element={<LoginPage />}
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="/auth/user/login"
          element={
            <UnProtectedRoute
              element={
                <UserLoginPage
                  role_id={RoleEnum.super}
                  title={"ministry_emp_portal"}
                />
              }
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="/auth/organization/login"
          element={
            <UnProtectedRoute
              element={
                <UserLoginPage
                  role_id={RoleEnum.organization}
                  title={"welcome"}
                />
              }
              authenticated={authenticated}
            />
          }
        />
        <Route
          path="/auth/donor/login"
          element={
            <UnProtectedRoute
              element={
                <UserLoginPage role_id={RoleEnum.donor} title={"welcome"} />
              }
              authenticated={authenticated}
            />
          }
        />
      </Route>
    </Routes>
  );
};
const site = (
  <Route path="/" element={<MainPage />}>
    {/* Default route (equivalent to `/`) */}
    <Route index path="/" element={<HomePage />} />
    <Route index path="home" element={<HomePage />} />
    <Route path="news" element={<NewsPage />} />
    <Route path="about_us" element={<AboutUsPage />} />
    <Route path="contact_us" element={<ContactUsPage />} />
    <Route path="faqs" element={<FaqsPage />} />
    <Route path="*" element={<HomePage />} />
  </Route>
);
