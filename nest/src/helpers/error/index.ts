export const CommonErrors = {
  EmailExist: {
    statusCode: 409,
    message: 'Email already exists',
    error: 'Conflict Error',
  },

  NotFound: {
    statusCode: 404,
    message: 'not exists',
    error: 'NotFound Error',
  },

  UserNotFound: {
    statusCode: 404,
    message: 'User not exists',
    error: 'NotFound Error',
  },

  RoleNotFound: {
    statusCode: 404,
    message: 'Role not exists',
    error: 'NotFound Error',
  },

  EmailNotFound: {
    statusCode: 404,
    message: 'Email not exists',
    error: 'NotFound Error',
  },

  Unauthorized: {
    statusCode: 401,
    message: 'Invalid credentials',
    error: 'Unauthorized Error',
  },

  UserInactive: {
    statusCode: 401,
    message: 'User not active',
    error: 'Unauthorized Error',
  },

  EmailNotVerified: {
    statusCode: 401,
    message: 'Please verify your email',
    error: 'Unauthorized Error',
  },

  MobileNotVerified: {
    statusCode: 401,
    message: 'Please verify your mobile number',
    error: 'Unauthorized Error',
  },

  WrongOtp: {
    statusCode: 401,
    response: {},
    message: 'Enter otp is not correct',
  },

  WrongPassword: {
    statusCode: 400,
    message: 'New password and confirm password not matched!',
    error: 'Bad Request',
  },

  LoginSessionOut: {
    statusCode: 400,
    message: 'New password and confirm password not matched!',
    error: 'Bad Request',
  },

  InvalidConversationDetails: {
    statusCode: 400,
    message: 'invalid conversation details',
    error: 'Bad Request',
  },

  ConversationNotFound: {
    statusCode: 404,
    message: 'Conversation not exists',
    error: 'NotFound Error',
  },
};
