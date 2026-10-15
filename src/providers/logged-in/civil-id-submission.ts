export type CivilStagingToken = {
  update_request_id: string;
  staging_revision: number;
};

/**
 * Keep the request id and staging revision from the latest successful side upload.
 * A response without that pair leaves the previous token unchanged.
 */
export function rememberCivilStaging(
  current: CivilStagingToken | null,
  response: { update_request_id?: unknown; staging_revision?: unknown } | null | undefined,
): CivilStagingToken | null {
  if (!response || typeof response.update_request_id !== 'string' || response.update_request_id === '') {
    return current;
  }
  if (response.staging_revision === undefined || response.staging_revision === null || response.staging_revision === '') {
    return current;
  }
  const revision = Number(response.staging_revision);
  if (!Number.isFinite(revision)) {
    return current;
  }

  return {
    update_request_id: response.update_request_id,
    staging_revision: revision,
  };
}

/**
 * A broken image only changes what is shown. It never asks the server to delete a document.
 */
export function civilPreviewOnError(): { requestRemoval: false; showPlaceholder: true } {
  return { requestRemoval: false, showPlaceholder: true };
}

/**
 * A confirmed save drops the request token. An error or a missing result keeps it,
 * including when the pending-status request fails.
 */
export function tokenAfterCivilSave(
  current: CivilStagingToken | null,
  result: { operation?: string } | null | undefined,
): CivilStagingToken | null {
  if (result?.operation === 'success') {
    return null;
  }

  return current;
}

export function canonicalCivilFormValues(profile: Record<string, any>, bucketUrl: string) {
  const front = profile.candidate_civil_photo_front || '';
  const back = profile.candidate_civil_photo_back || '';

  return {
    candidate_civil_id: profile.candidate_civil_id || '',
    candidate_civil_expiry_date: profile.candidate_civil_expiry_date || '',
    candidate_civil_photo_front: front,
    candidate_civil_photo_back: back,
    candidate_civil_photo_front_url: front ? `${bucketUrl}photos/${front}` : '',
    candidate_civil_photo_back_url: back ? `${bucketUrl}photos/${back}` : '',
  };
}

/**
 * Prefer the profile fetched after a successful save. Fall back to the save response.
 */
export function applyCommittedCivilId(
  user: Record<string, any> | null,
  response: Record<string, any>,
  profile: Record<string, any> | null,
): Record<string, any> | null {
  if (profile) {
    return profile;
  }
  if (!user) {
    return null;
  }

  return {
    ...user,
    candidate_civil_id: response.candidate_civil_id ?? user.candidate_civil_id,
    candidate_civil_expiry_date: response.candidate_civil_expiry_date ?? user.candidate_civil_expiry_date,
    candidate_civil_photo_front: response.candidate_civil_photo_front ?? user.candidate_civil_photo_front,
    candidate_civil_photo_back: response.candidate_civil_photo_back ?? user.candidate_civil_photo_back,
    is_incomplete_profile: response.is_incomplete_profile ?? user.is_incomplete_profile,
    candidate_pending_profile: response.candidate_pending_profile ?? user.candidate_pending_profile,
  };
}
