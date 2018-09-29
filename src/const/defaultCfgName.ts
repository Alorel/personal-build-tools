import {IS_TEST_ENV} from './IS_CI';

export const defaultCfgName = IS_TEST_ENV ? '.alobuild.ci.yml' : '.alobuild.yml';
