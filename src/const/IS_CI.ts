export const IS_TEST_ENV = !!process.env.RUNNING_PERSONAL_BUILD_TOOLS_TESTS;
export const IS_CI = IS_TEST_ENV || !!process.env.CI;
