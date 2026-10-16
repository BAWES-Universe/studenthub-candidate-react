import { Observable } from "@reduxjs/toolkit";
import axios from "@/providers/AxiosService";
import { store } from "@/store/store";
import { Candidate } from "@/models/candidate";
//import { useSelector } from "react-redux";

const _accountEndpoint = '/account';

/**
 * @returns Candidate
 * load profile details
 */
export async function profile(): Promise<any> {
  const url = _accountEndpoint + '/profile?expand=candidateLinks,certificates,certificates.exam,certificates.store,certificates.company,candidateTags,' +
    'candidateEducations,candidateEducations.major,candidateEducations.university,' +
    'candidateEducations.degree,isWorking,bank,area,isProfileCompleted,nationality,country,university,candidateSkills,candidateExperiences,totalInterviewScheduled';
    const response = await axios.get(url);
    return response.data;
}

/**
 * return work history
 */
export async function workHistory(): Promise<any> {
  const url = _accountEndpoint + '/work-history?expand=store,company';
  const response = await axios.get(url);
  return response.data;
}

/**
 * @returns 
 */
export async function profileWithBank(): Promise<any> {
  const url = _accountEndpoint + '/profile?expand=bank';
  const response = await axios.get(url);
  return response.data;
}

/**
 * get job search status
 */
export async function getJobSearchStatus(): Promise<any> {
  const url = _accountEndpoint + '/job-search-status?expand=brands';
  const response = await axios.get(url);
  return response.data;
}

/**
 * update job-search-status
 * @param params 
 */
export async function updateJobSearchStatus(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/job-search-status';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * update experiences
 * @param params 
 */
export async function updateExperiences(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-experiences';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * update skills
 * @param params 
 */
export async function updateSkills(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-skills';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * remove civol id front photo
 */
export async function removeCivilPhotoFront(): Promise<any> {
  const url = `${_accountEndpoint}` + '/remove-civil-photo-front';
  const response = await axios.delete(url);
  return response.data;
}

/**
 * remove civol id back photo
 */
export async function   removeCivilPhotoBack(): Promise<any> {
  const url = `${_accountEndpoint}` + '/remove-civil-photo-back';
  const response = await axios.delete(url);
  return response.data;
}

/**
 * Remove candidate's profile photo 
 */
export async function removePhoto(): Promise<any> {
  const url = `${_accountEndpoint}` + '/remove-photo';
  const response = await axios.delete(url);
  return response.data;
}

/**
 * List of all stores
 * @returns {Observable<any>}
 */
export async function listSalary(page: number): Promise<any> {
  const url = _accountEndpoint + '/salary?page=' + page + '&expand=bank';
  const response = await axios.get(url);
  return response;
}

/**
 * view salary detail
 * @returns {Observable<any>}
 */
export async function viewSalary(tc_id: number): Promise<any> {
  const url = _accountEndpoint + '/salary/' + tc_id + '?expand=bank';
  const response = await axios.get(url);
  return response.data;
}

/**
 * toggle-two-step-auth
 * @returns {Observable<any>}
 */
export async function toggleTwoStepAuth(): Promise<any> {
  const url = `${_accountEndpoint}` + '/toggle-two-step-auth';
  const response = await axios.patch(url, { });
  return response.data;
}

/**
 * Create
 * @param {oldPassword} string
 * @param {newPassword} string
 * @returns {Observable<any>}
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<any> {
  const postUrl = `${_accountEndpoint}` + '/change-password';
  const params = {
    old_password: oldPassword,
    new_password: newPassword,
  };
  const response = await axios.post(postUrl, params);
  return response.data;
}

/**
 * Update email address 
 * @param email string 
 */
export async function updateEmail(email: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-email';
  const response = await axios.post(url, { email: email });
  return response.data;
}

/**
 * set user language preference 
 * @param code language code 
 */
export async function setLanguagePref(code: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/language-pref';
  const response = await axios.post(url, {
      language_pref: code
  });
  return response.data;
}

/**
 * update nationality
 * @param country_id number
 */
export async function updateNationality(country_id: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-nationality';
  const response = await axios.post(url, {
    country_id: country_id
  });
  return response.data;
}

/**
 * update university
 * @param university_id number
 */
export async function updateUniversity(university_id: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-university';
  const response = await axios.post(url, {
    university_id: university_id
  });
  return response.data;
}

/**
 * area by geo cordinates
 * @param latitude 
 * @param longitude 
 */
export async function getAreaByLocation(latitude: number, longitude: number, area = null): Promise<any> {
  let url = `${_accountEndpoint}` + '/area-by-location?latitude=' + latitude + '&longitude=' + longitude;

  if(area)
    url += '&area=' + area;

  const response = await axios.get(url);
  return response.data;
}

/**
 * update intro
 * @param intro string
 */
export async function updateIntro(intro: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-intro';
  const response = await axios.post(url, {
    intro: intro
  });
  return response.data;
}

/**
 * update objective
 * @param objective string
 */
export async function updateObjective(objective: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-objective';
  const response = await axios.post(url, {
    objective: objective
  });
  return response.data;
}

/**
 * update gender
 * @param gender number
 */
export async function updateGender(gender: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-gender';
  const response = await axios.post(url, {
    gender: gender
  });
  return response.data;
}

export async function updateNames(name_en: string, name_ar: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-names';
  const response = await axios.post(url, {
    name_en: name_en,
    name_ar: name_ar
  });
  return response.data;
}

/**
 * update name
 * @param name string
 */
export async function updateName(name: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-name';
  const response = await axios.post(url, {
    name: name
  });
  return response.data;
}

/**
 * update arabic name
 * @param name_ar string
 */
export async function updateNameAr(name_ar: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-name-ar';
  const response = await axios.post(url, {
    name_ar: name_ar
  });
  return response.data;
}

/**
 * update civil id number
 * @param civil_id 
 */
export async function updateCivilId(civil_id: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-civil-id';
  const response = await axios.post(url, {
    civil_id: civil_id
  });
  return response.data;
}

/**
 * update civil id number and civil_expiry_date
 * @param civil_id
 * @param civil_expiry_date
 */
export async function updateCivilIdAndExpiryDate(civil_id: string, civil_expiry_date: string = ""): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-civil-id-expiry-date';
  const response = await axios.post(url, {
    civil_id: civil_id,
    civil_expiry_date: civil_expiry_date
  });
  return response.data;
}

/**
 * update resume
 * @param resume string
 */
export async function updateResume(resume: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-resume';
  const response = await axios.post(url, {
    resume: resume
  });
  return response.data;
}

/**
 * update candidate location
 * @param params 
 */
export async function updateLocation(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-location';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * check cloudinary video status 
 */
export async function checkVideoStatus(): Promise<any> {
  const url = `${_accountEndpoint}` + '/video-status';
  const response = await axios.get(url);
  return response.data;
}

/**
 * update Video to introduct candidate
 * @param candidate_video string
 */
export async function updateVideo(candidate_video: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/video';
  const response = await axios.post(url, {
    video: candidate_video
  });
  return response.data;
}

/**
 * delete Resume 
 */
export async function deleteResume(): Promise<any> {
  const url = `${_accountEndpoint}` + '/remove-resume';
  const response = await axios.delete(url);
  return response.data;
}

/**
 * delete Video 
 */
export async function deleteVideo(): Promise<any> {
  const url = `${_accountEndpoint}` + '/remove-video';
  const response = await axios.delete(url);
  return response.data;
}

/**
 * update profile photo
 * @param personal_photo string
 */
export async function updateProfilePhoto(personal_photo: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/profile-photo';
  const response = await axios.post(url, {
    personal_photo: personal_photo
  });
  return response.data;
  }

/**
 * update birth-date
 * @param birth_date string
 */
export async function updateBirthDate(birth_date: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-birth-date';
  const response = await axios.post(url, {
    birth_date: birth_date
  });
  return response.data;
}

/**
 * update back image of civil id
 * @param civil_photo_back 
 */
export async function updateCivilPhotoBack(civil_photo_back: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-civil-photo-back';
  const response = await axios.post(url, {
    civil_photo_back: civil_photo_back
  });
  return response.data;
}

/**
 * update front image of civil id
 * @param civil_photo_front 
 */
export async function updateCivilPhotoFront(civil_photo_front: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-civil-photo-front';
  const response = await axios.post(url, {
    civil_photo_front: civil_photo_front
  });
  return response.data;
}

/**
 * update civil expiry date
 * @param civil_expiry_date 
 */
export async function updateCivilExpiryDate(civil_expiry_date: string): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-civil-expiry-date';
  const response = await axios.post(url, {
    civil_expiry_date: civil_expiry_date
  });
  return response.data;
}

/**
 * update driving license
 * @param driving_license number
 */
export async function updateDrivingLicense(driving_license: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-driving-license';
  const response = await axios.post(url, {
    driving_license: driving_license
  });
  return response.data;
}

/**
 * update kuwaiti National Status with country id
 * @param country_id number
 * @param candidate_mom_kuwaiti number
 */
export async function updateNationalityWithKuwaitiStatus(country_id: number, candidate_mom_kuwaiti: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-nationality-with-kuwaiti-status'; 
  const response = await axios.post(url, {
    country_id: country_id,
    candidate_mom_kuwaiti: candidate_mom_kuwaiti
  });
  return response.data;
}

/**
 * update kuwaiti National Status
 * @param candidate_mom_kuwaiti number
 */
export async function updateKuwaitiNationalStatus(candidate_mom_kuwaiti: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-kuwaiti-national';
  const response = await axios.post(url, {
    candidate_mom_kuwaiti: candidate_mom_kuwaiti
  });
  return response.data;
}

/**
 * update bank detail
 * @param params 
 */
export async function updateBankDetail(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-bank-detail';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * update phone number
 * @param params 
 */
export async function updatePhoneDetail(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-phone';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * update preferred time
 * @param params 
 */
export async function updatePreferredTime(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-preferred-time';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * update profile url
 * @param params 
 */
export async function updateProfileUrl(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/update-profile-url';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * discard session
 */
export async function discardSession(): Promise<any> {
  const url = `${_accountEndpoint}` + '/discard-session';
  const response = await axios.delete(url);
  return response.data;
}

/**
 * start work
 * @param lat number
 * @param long number
 */
export async function startWork(lat: number, long: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/start-time';
  const response = await axios.post(url, { lat, long });
  return response.data;
}

/**
 * stop work
 * @param lat number
 * @param long number
 */
export async function stopWork(lat: number, long: number): Promise<any> {
  const url = `${_accountEndpoint}` + '/stop-time';
  const response = await axios.post(url, { lat, long });
  return response.data;
}

/**
 * check work status
 */
export async function checkWorkStatus(): Promise<any> {
  const url = `${_accountEndpoint}` + '/current-status';
  const response = await axios.post(url, {});
  return response.data;
}

/**
 * remove profile
 */
export async function removeProfile(): Promise<any> {
  const url = `${_accountEndpoint}` + '/remove-candidate-profile';
  const response = await axios.delete(url);
  return response.data;
}

/**
 * Update password
 * @returns {Observable<any>}
 */
export async function validatePassword(params: any): Promise<any> {
  const url = `${_accountEndpoint}` + '/validate-password';
  const response = await axios.post(url, params);
  return response.data;
}

/**
 * get next route to complete profile
 * @returns string
 */
export function getNextRouteToCompleteProfile(user: Candidate | null) {

  if (!user || !user.candidate_email) {
    return 'profile';
  }

  if (!user.candidate_name || !user.candidate_name_ar) {
    return 'name';
  } else if (!user.candidate_phone) {
    return 'phone-number';
  } else if (!user.candidate_birth_date) {
    return 'dob';
  } else if (!user.candidate_gender) {
    return 'gender';
  } else if (!user.nationality) {
    return 'nationality';
  } else if (!user.area) {
    return 'area';
  } else if (!user.candidateEducations || user.candidateEducations.length == 0) {
    return 'educations';
  } else if (!user.candidateSkills || user.candidateSkills.length == 0) {
    return 'skills';
  } else if (!user.candidate_driving_license) {
    return 'driver-license';
  } else if (!user.candidate_personal_photo) {
    return 'personal-photo';
  } else if (!user.candidate_intro) {
    return 'about-yourself';
  } else if (!user.candidate_objective) {
    return 'objective';
  //} else if (!user.candidate_video) {
  //  return 'video';
  } else if (!user.candidate_civil_id) {
    return 'civil-id';
  } else if (!user.candidate_preferred_time) {
    return 'preferred-time';
  } /*else {
    return 'profile';
  }*/
}