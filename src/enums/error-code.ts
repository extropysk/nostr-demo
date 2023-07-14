export enum ErrorCode {
  SignEventFailed = 'SIGN_EVENT_FAILED',
  PublishFailed = 'PUBLISH_FAILED',
  PublicKeyNotFound = 'PUBLIC_KEY_NOT_FOUND',
  InitializationFailed = 'INITIALIZATION_FAILED',
}

export type Error = {
  code: ErrorCode
  message: string
}
