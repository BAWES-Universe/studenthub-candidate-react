export type CivilStagingToken = {
  update_request_id: string;
  staging_revision: number;
};

export type CivilDraft = {
  token: CivilStagingToken | null;
  candidate_civil_id: string;
  candidate_civil_expiry_date: string;
  candidate_civil_photo_front: string;
  candidate_civil_photo_back: string;
  front_preview: string;
  back_preview: string;
};

type StagingResponse = {
  operation?: string;
  message?: unknown;
  update_request_id?: unknown;
  staging_revision?: unknown;
  staged_photo_front?: unknown;
  staged_photo_back?: unknown;
  suggested_civil_id?: unknown;
  suggested_civil_expiry_date?: unknown;
  candidate_civil_photo_front?: unknown;
  candidate_civil_photo_back?: unknown;
  candidate_civil_id?: unknown;
  candidate_civil_expiry_date?: unknown;
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
  if (
    current
    && current.update_request_id === response.update_request_id
    && revision < current.staging_revision
  ) {
    return current;
  }

  return {
    update_request_id: response.update_request_id,
    staging_revision: revision,
  };
}

/**
 * Same request and an earlier revision than the one already accepted.
 * A response with no revision is not ordered against the token.
 */
export function isStaleStagingResponse(
  current: CivilStagingToken | null,
  response: { update_request_id?: unknown; staging_revision?: unknown } | null | undefined,
): boolean {
  if (!current || !response || response.update_request_id !== current.update_request_id) {
    return false;
  }
  if (response.staging_revision === undefined || response.staging_revision === null || response.staging_revision === '') {
    return false;
  }
  const revision = Number(response.staging_revision);
  return Number.isFinite(revision) && revision < current.staging_revision;
}

function presentText(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * Apply one upload response, or leave the draft unchanged when that response is older.
 * The returned draft is the form state the next submit would send.
 */
export function applyCivilUploadResponse(
  draft: CivilDraft,
  response: StagingResponse | null | undefined,
  options?: { side?: 'front' | 'back'; previewUrl?: string },
): { draft: CivilDraft; accepted: boolean; staged: boolean } {
  if (!response || isStaleStagingResponse(draft.token, response)) {
    return { draft, accepted: false, staged: false };
  }

  const next: CivilDraft = {
    ...draft,
    token: rememberCivilStaging(draft.token, response),
  };
  const stagedFront = presentText(response.staged_photo_front);
  const stagedBack = presentText(response.staged_photo_back);
  if (stagedFront || stagedBack) {
    if (stagedBack) {
      next.candidate_civil_photo_back = stagedBack;
      if (options?.side === 'back' && options.previewUrl) {
        next.back_preview = options.previewUrl;
      } else if (stagedBack !== draft.candidate_civil_photo_back) {
        next.back_preview = '';
      }
    }
    if (stagedFront) {
      next.candidate_civil_photo_front = stagedFront;
      if (options?.side === 'front' && options.previewUrl) {
        next.front_preview = options.previewUrl;
      } else if (stagedFront !== draft.candidate_civil_photo_front) {
        next.front_preview = '';
      }
    }
    const suggestedId = presentText(response.suggested_civil_id);
    const suggestedExpiry = presentText(response.suggested_civil_expiry_date);
    if (suggestedId) {
      next.candidate_civil_id = suggestedId;
    }
    if (suggestedExpiry) {
      next.candidate_civil_expiry_date = suggestedExpiry;
    }

    return { draft: next, accepted: true, staged: true };
  }

  const back = presentText(response.candidate_civil_photo_back);
  const front = presentText(response.candidate_civil_photo_front);
  const civilId = presentText(response.candidate_civil_id);
  const expiry = presentText(response.candidate_civil_expiry_date);
  if (back) {
    next.candidate_civil_photo_back = back;
  }
  if (front) {
    next.candidate_civil_photo_front = front;
  }
  if (civilId) {
    next.candidate_civil_id = civilId;
  }
  if (expiry) {
    next.candidate_civil_expiry_date = expiry;
  }

  return { draft: next, accepted: true, staged: false };
}

/**
 * A failed removal keeps the form and the current revision.
 * A staged removal stores the new revision. An older success does not clear the form.
 * A removal with no pending request clears the token.
 */
export function civilRemovalOutcome(
  current: CivilStagingToken | null,
  response: StagingResponse | null | undefined,
): { clearForm: boolean; token: CivilStagingToken | null; message: string | null; ignored: boolean } {
  if (!response || response.operation !== 'success') {
    const message = response && typeof response.message === 'string' && response.message !== ''
      ? response.message
      : 'Could not remove the photo. Please try again.';

    return { clearForm: false, token: current, message, ignored: false };
  }

  if (isStaleStagingResponse(current, response)) {
    return { clearForm: false, token: current, message: null, ignored: true };
  }

  if (typeof response.update_request_id !== 'string' || response.update_request_id === '') {
    return { clearForm: true, token: null, message: null, ignored: false };
  }

  return {
    clearForm: true,
    token: rememberCivilStaging(current, response),
    message: null,
    ignored: false,
  };
}

/** Clear one side only when that removal is the accepted revision. */
export function applyCivilRemoval(
  draft: CivilDraft,
  response: StagingResponse | null | undefined,
  side: 'front' | 'back',
): { draft: CivilDraft; clearForm: boolean; message: string | null; ignored: boolean } {
  const outcome = civilRemovalOutcome(draft.token, response);
  if (!outcome.clearForm) {
    return { draft, clearForm: false, message: outcome.message, ignored: outcome.ignored };
  }

  const next: CivilDraft = { ...draft, token: outcome.token };
  if (side === 'front') {
    next.candidate_civil_photo_front = '';
    next.front_preview = '';
  } else {
    next.candidate_civil_photo_back = '';
    next.back_preview = '';
  }

  return { draft: next, clearForm: true, message: null, ignored: false };
}

/** Fields sent with the final Civil ID save. */
export function civilSubmissionPayload(draft: CivilDraft) {
  return {
    civil_id: draft.candidate_civil_id,
    civil_expiry_date: draft.candidate_civil_expiry_date,
    ...(draft.token ? {
      update_request_id: draft.token.update_request_id,
      staging_revision: draft.token.staging_revision,
    } : {}),
  };
}

/** Drop a previous blob preview when a new one replaces it. Remote URLs stay untouched. */
export function replacePreviewUrl(current: string | null | undefined, next: string): string {
  if (typeof current === 'string' && current.startsWith('blob:') && current !== next) {
    URL.revokeObjectURL(current);
  }

  return next;
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
