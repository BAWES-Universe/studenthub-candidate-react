import React, { Suspense, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { RootState, useAppSelector } from './store/store';

//page loaders
import LoadingHomePage from './pages/(dash)/home/loading';
import LoadingAboutYourself from './pages/(auth)/about-yourself/loading';
import LoadingArea from './pages/(auth)/area/loading';
import LoadingCivilId from './pages/(auth)/civil-id/loading';
import LoadingComplete from './pages/(auth)/complete/loading';
import LoadingContact from './pages/(auth)/contact/loading';
import LoadingDob from './pages/(auth)/dob/loading';
import LoadingDriverLicense from './pages/(auth)/driver-license/loading';
import LoadingEducations from './pages/(auth)/educations/loading';
import LoadingEmail from './pages/(auth)/email/loading';
import LoadingExperiences from './pages/(auth)/experience/loading';
import LoadingGender from './pages/(auth)/gender/loading';
import LoadingForgotPassword from './pages/(auth)/forgot-password/loading';
import LoadingLogin from './pages/(auth)/login/loading';
import LoadingAuthCallback from './pages/(auth)/auth-callback/loading';
import LoadingName from './pages/(auth)/name/loading';
import LoadingNationality from './pages/(auth)/nationality/loading';
import LoadingObjective from './pages/(auth)/objective/loading';
import LoadingPersonalInfoComplete from './pages/(auth)/personal-info-complete/loading';
import LoadingPersonalPhoto from './pages/(auth)/personal-photo/loading';
import LoadingPhoneNumber from './pages/(auth)/phone-number/loading';
import LoadingPreferredTime from './pages/(auth)/preferred-time/loading';
import LoadingProfileUrl from './pages/(auth)/profile-url/loading';
import LoadingSkills from './pages/(auth)/skills/loading';
import LoadingUpdatePassword from './pages/(auth)/update-password/[token]/loading';
import LoadingVerifyEmail from './pages/(auth)/verify-email/[email]/loading';
import LoadingVideo from './pages/(auth)/video/loading';
import LoadingActivity from './pages/(dash)/activity/loading';
import LoadingAssignment from './pages/(dash)/assignment/[id]/loading';
import LoadingBank from './pages/(dash)/bank/loading';
import LoadingChangePassword from './pages/(dash)/change-password/loading';
import LoadingDiscount from './pages/(dash)/discounts/[id]/loading';
import LoadingDiscounts from './pages/(dash)/discounts/loading';
import LoadingChatView from './pages/(dash)/chat/[id]/loading';
import LoadingChatList from './pages/(dash)/chat/loading';
import LoadingInterview from './pages/(dash)/interview/[id]/loading';
import LoadingInterviewList from './pages/(dash)/interview/loading';
import LoadingInvitation from './pages/(dash)/invitation/[id]/loading';
import LoadingInvitationList from './pages/(dash)/invitation/loading';
import LoadingJobView from './pages/(dash)/jobs/[id]/loading';
import LoadingJobList from './pages/(dash)/jobs/loading';
import LoadingPaymentView from './pages/(dash)/payments/[id]/loading';
import LoadingPayments from './pages/(dash)/payments/loading';
import LoadingProfile from './pages/(dash)/profile/loading';
import LoadingRequestView from './pages/(dash)/request/[id]/loading';
import LoadingRequestList from './pages/(dash)/request/loading';
import LoadingWallet from './pages/(dash)/wallet/loading';
import LoadingWorkHistory from './pages/(dash)/work-history/loading';
import LoadingAppeal from './pages/(dash)/work-log/appeal/[id]/loading';
import LoadingLogDateList from './pages/(dash)/work-log/log-date-list/loading';
import LoadingLogHourList from './pages/(dash)/work-log/log-hour-list/[date]/loading';
import LoadingTrackWork from './pages/(dash)/work-log/track-work/loading';
import LoadingEducationCompleted from './pages/(auth)/education-complete/loading';

//pages

const AboutYourselfPage = React.lazy(() => import('./pages/(auth)/about-yourself/page'));
const VerifyEmailPage = React.lazy(() => import('./pages/(auth)/verify-email/[email]/page'));
const UpdatePasswordPage = React.lazy(() => import('./pages/(auth)/update-password/[token]/page'));
const AreaPage = React.lazy(() => import('./pages/(auth)/area/page'));
const CivilIdPage = React.lazy(() => import('./pages/(auth)/civil-id/page'));
const DobPage = React.lazy(() => import('./pages/(auth)/dob/page'));
const CompletePage = React.lazy(() => import('./pages/(auth)/complete/page'));
const ContactPage = React.lazy(() => import('./pages/(auth)/contact/page'));
const DriverLicensePage = React.lazy(() => import('./pages/(auth)/driver-license/page'));
const EducationCompletedPage = React.lazy(() => import('./pages/(auth)/education-complete/page'));
const EducationsPage = React.lazy(() => import('./pages/(auth)/educations/page'));
const EmailPage = React.lazy(() => import('./pages/(auth)/email/page'));
const ExperiencesPage = React.lazy(() => import('./pages/(auth)/experience/page'));
const ForgotPasswordPage = React.lazy(() => import('./pages/(auth)/forgot-password/page'));
const GenderPage = React.lazy(() => import('./pages/(auth)/gender/page'));
const NamePage = React.lazy(() => import('./pages/(auth)/name/page'));
const NationalityPage = React.lazy(() => import('./pages/(auth)/nationality/page'));
const ObjectivePage = React.lazy(() => import('./pages/(auth)/objective/page'));
const PersonalInfoCompletePage = React.lazy(() => import('./pages/(auth)/personal-info-complete/page'));
const PersonalPhotoPage = React.lazy(() => import('./pages/(auth)/personal-photo/page'));
const PhoneNumberPage = React.lazy(() => import('./pages/(auth)/phone-number/page'));
const PreferredTimePage = React.lazy(() => import('./pages/(auth)/preferred-time/page'));
const ProfilePage = React.lazy(() => import('./pages/(dash)/profile/page'));
const ProfileUrlPage = React.lazy(() => import('./pages/(auth)/profile-url/page'));
const SkillsPage = React.lazy(() => import('./pages/(auth)/skills/page'));
const VideoPage = React.lazy(() => import('./pages/(auth)/video/page'));
const ActivityPage = React.lazy(() => import('./pages/(dash)/activity/page'));
const AssignmentPage = React.lazy(() => import('./pages/(dash)/assignment/[id]/page'));
const UpdateBankPage = React.lazy(() => import('./pages/(dash)/bank/page'));
const ChangePasswordPage = React.lazy(() => import('./pages/(dash)/change-password/page'));
const ChatListPage = React.lazy(() => import('./pages/(dash)/chat/page'));
const ChatViewPage = React.lazy(() => import('./pages/(dash)/chat/[id]/page'));
const DiscountsPage = React.lazy(() => import('./pages/(dash)/discounts/page'));
const DiscountViewPage = React.lazy(() => import('./pages/(dash)/discounts/[id]/page'));
const InterviewListPage = React.lazy(() => import('./pages/(dash)/interview/page'));
const InterviewDetailPage = React.lazy(() => import('./pages/(dash)/interview/[id]/page'));
const InvitationDetailPage = React.lazy(() => import('./pages/(dash)/invitation/[id]/page'));
const InvitationListPage = React.lazy(() => import('./pages/(dash)/invitation/page'));
const JobDetailPage = React.lazy(() => import('./pages/(dash)/jobs/[id]/page'));
const JobsPage = React.lazy(() => import('./pages/(dash)/jobs/page'));
const PaymentsPage = React.lazy(() => import('./pages/(dash)/payments/page'));
const PaymentDetailPage = React.lazy(() => import('./pages/(dash)/payments/[id]/page'));
const RequestListPage = React.lazy(() => import('./pages/(dash)/request/page'));
const RequestViewPage = React.lazy(() => import('./pages/(dash)/request/[id]/page'));
const WalletBalanceListPage = React.lazy(() => import('./pages/(dash)/wallet/page'));
const WorkHistoryPage = React.lazy(() => import('./pages/(dash)/work-history/page'));
const AppealDetailPage = React.lazy(() => import('./pages/(dash)/work-log/appeal/[id]/page'));
const LogDateListPage = React.lazy(() => import('./pages/(dash)/work-log/log-date-list/page'));
const LogHourListPage = React.lazy(() => import('./pages/(dash)/work-log/log-hour-list/[date]/page'));
const TrackWorkPage = React.lazy(() => import('./pages/(dash)/work-log/track-work/page'));
const LoginPage = React.lazy(() => import('./pages/(auth)/login/page'));
const AuthCallbackPage = React.lazy(() => import('./pages/(auth)/auth-callback/page'));
//const ServerErrorPage = React.lazy(() => import('./pages/(errors)/server-error/page'));

import NoInternetErrorPage from './pages/(errors)/no-internet/page';
import ServerErrorPage from './pages/(errors)/server-error/page';
import NotFoundPage from './pages/(errors)/not-found/page';
import HomePage from './pages/(dash)/home/page';
import LandingPage from './pages/(auth)/landing/page';

import { error404$, error500$, internetOffline$, userLogout$ } from "@/providers/event.service";
import { useIonRouter } from '@ionic/react';
import LoginTwoStepPage from './pages/(auth)/login-two-step/page';

export default function RouterComponent() {

  const router = useIonRouter();
  
    useEffect(() => {
      
    error404$.subscribe(data => {
      router.push('/not-found');
    });

    error500$.subscribe(data => {
      router.push('/server-error');
    });

    // Check for network connection
    internetOffline$.subscribe(async () => {
      /*let alert = await this.alertCtrl.create({
        header: 'No Internet Connection',
        subHeader: 'Sorry, no Internet connectivity detected. Please reconnect and try again.',
        buttons: ['Dismiss']
      });
      alert.present();*/

      router.push('/no-internet');
    });

    error500$.subscribe(userEventData => {
      router.push('/server-error');
    });

    error404$.subscribe(userEventData => {
      router.push('/not-found');
    });

    // On Logout Event, set root to Login Page
    userLogout$.subscribe((logoutReason) => {
      router.push('/');
    });
    }, []);

    return (
        <Switch>
            <Route exact={true} path="/">
              <Redirect to="/home" />
            </Route>

            <Route exact={true} path="/landing">
              {/*<Suspense fallback={<LoadingLandingPage />}> */}
              <LandingPage />
              {/*</Suspense>*/}
            </Route>

            <Route exact={true} path="/login-two-step/:token">
              <Suspense fallback={<LoadingLogin />}>
                <LoginTwoStepPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/login">
              <Suspense fallback={<LoadingLogin />}>
                <LoginPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/auth/callback">
              <Suspense fallback={<LoadingAuthCallback />}>
                <AuthCallbackPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/about-yourself">
              <Suspense fallback={<LoadingAboutYourself />}>
                <AboutYourselfPage />
              </Suspense>
            </Route>


            <Route exact={true} path="/area">
              <Suspense fallback={<LoadingArea />}>
                <AreaPage />
              </Suspense>
            </Route>
            <Route exact={true} path="/civil-id">
              <Suspense fallback={<LoadingCivilId />}>
                <CivilIdPage />
              </Suspense>
            </Route>
            <Route exact={true} path="/complete">
              <Suspense fallback={<LoadingComplete />}>
                <CompletePage />
              </Suspense>
            </Route>
            <Route exact={true} path="/contact">
              <Suspense fallback={<LoadingContact />}>
                <ContactPage />
              </Suspense>
            </Route>
            <Route exact={true} path="/dob">
              <Suspense fallback={<LoadingDob />}>
                <DobPage />
              </Suspense>
            </Route>
            <Route exact={true} path="/driver-license">
              <Suspense fallback={<LoadingDriverLicense />}>
                <DriverLicensePage />
              </Suspense>
            </Route>
            
            <Route exact={true} path="/education-complete">
              <Suspense fallback={<LoadingEducationCompleted />}>  
              <EducationCompletedPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/educations">
              <Suspense fallback={<LoadingEducations />}>
                <EducationsPage />
              </Suspense>
            </Route>
            <Route exact={true} path="/email">
              <Suspense fallback={<LoadingEmail />}>
                <EmailPage />
              </Suspense>
            </Route>
            <Route exact={true} path="/experience">
              <Suspense fallback={<LoadingExperiences />}>
                <ExperiencesPage />
              </Suspense>
            </Route>
            <Route exact={true} path="/forgot-password">
              <Suspense fallback={<LoadingForgotPassword />}>
                <ForgotPasswordPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/gender">
              <Suspense fallback={<LoadingGender />}>
                <GenderPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/name">
              <Suspense fallback={<LoadingName />}>
                <NamePage />
              </Suspense>
            </Route>

            <Route exact={true} path="/nationality">
              <Suspense fallback={<LoadingNationality />}>
                <NationalityPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/objective">
              <Suspense fallback={<LoadingObjective />}>
                <ObjectivePage />
              </Suspense>
            </Route>

            <Route exact={true} path="/personal-info-complete">
              <Suspense fallback={<LoadingPersonalInfoComplete />}>
                <PersonalInfoCompletePage />
              </Suspense>
            </Route>

            <Route exact={true} path="/personal-photo">
              <Suspense fallback={<LoadingPersonalPhoto />}>
                <PersonalPhotoPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/phone-number">
              <Suspense fallback={<LoadingPhoneNumber />}>
                <PhoneNumberPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/preferred-time">
              <Suspense fallback={<LoadingPreferredTime />}>
                <PreferredTimePage />
              </Suspense>
            </Route>

            <Route exact={true} path="/profile-url">
              <Suspense fallback={<LoadingProfileUrl />}>
                <ProfileUrlPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/skills">
              <Suspense fallback={<LoadingSkills />}>
                <SkillsPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/update-password/:token">
              <Suspense fallback={<LoadingUpdatePassword />}>
                <UpdatePasswordPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/verify-email/:email/:code">
              <Suspense fallback={<LoadingVerifyEmail />}>
                <VerifyEmailPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/verify-email/:email">
              <Suspense fallback={<LoadingVerifyEmail />}>
                <VerifyEmailPage />
              </Suspense>
            </Route>

            <Route exact={true} path="/video">
              <Suspense fallback={<LoadingVideo />}>
                <VideoPage />
              </Suspense>
            </Route>
            
            {/* dahboard pages */}

            <PrivateRoute exact={true} path="/activity">
              <Suspense fallback={<LoadingActivity />}>
                <ActivityPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/assignment/:id">
              <Suspense fallback={<LoadingAssignment />}>
                <AssignmentPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/bank">
              <Suspense fallback={<LoadingBank />}>
                <UpdateBankPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/change-password">
              <Suspense fallback={<LoadingChangePassword />}>
                <ChangePasswordPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/discounts/:id">
              <Suspense fallback={<LoadingDiscount />}>
                <DiscountViewPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/discounts">
              <Suspense fallback={<LoadingDiscounts />}>
                <DiscountsPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/chat/:id">
              <Suspense fallback={<LoadingChatView />}>
                <ChatViewPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/chat">
              <Suspense fallback={<LoadingChatList />}>
                <ChatListPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/home">
              <Suspense fallback={<LoadingHomePage />}>
                <HomePage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/interview/:id">
              <Suspense fallback={<LoadingInterview />}>
                <InterviewDetailPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/interview">
              <Suspense fallback={<LoadingInterviewList />}>
                <InterviewListPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/invitation/:id">
              <Suspense fallback={<LoadingInvitation />}>
                <InvitationDetailPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/invitation">
              <Suspense fallback={<LoadingInvitationList />}>
                <InvitationListPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/jobs/:id">
              <Suspense fallback={<LoadingJobView />}>
                <JobDetailPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/jobs">
              <Suspense fallback={<LoadingJobList />}>
                <JobsPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/payments/:id">
              <Suspense fallback={<LoadingPaymentView />}>
                <PaymentDetailPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/payments">
              <Suspense fallback={<LoadingPayments />}>
                <PaymentsPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/profile">
              <Suspense fallback={<LoadingProfile />}>
                <ProfilePage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/request/:id">
              <Suspense fallback={<LoadingRequestView />}>
                <RequestViewPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/request">
              <Suspense fallback={<LoadingRequestList />}>
                <RequestListPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/wallet">
              <Suspense fallback={<LoadingWallet />}>
                <WalletBalanceListPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/work-history">
              <Suspense fallback={<LoadingWorkHistory />}>
                <WorkHistoryPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/work-log/appeal/:id">
              <Suspense fallback={<LoadingAppeal />}>
                <AppealDetailPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/work-log/log-date-list">
              <Suspense fallback={<LoadingLogDateList />}>
                <LogDateListPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/work-log/log-hour-list/:date">
              <Suspense fallback={<LoadingLogHourList />}>
                <LogHourListPage />
              </Suspense>
            </PrivateRoute>

            <PrivateRoute exact={true} path="/work-log/track-work">
              <Suspense fallback={<LoadingTrackWork />}>
                <TrackWorkPage />
              </Suspense>
            </PrivateRoute>

            <Route exact={true} path="/server-error">
              <ServerErrorPage />
            </Route>

            <Route exact={true} path="/no-internet">
              <NoInternetErrorPage />
            </Route>

            <Route exact={true} path="/not-found">
              <NotFoundPage />
            </Route>

            <Redirect to="/" />
          </Switch>
    )
}


// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }: any) {//{ children: React.ReactNode, ...rest: any }

  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  //store.getState().auth;
  //useAppSelector((state) => state.auth);
  
  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/landing",
              state: { 
                from: location,
              },
            }}
          />
        )
      }
    />
  );
}
