import {IS_CI} from './IS_CI';

export const defaultCfgName = IS_CI ? '.alobuild.ci.yml' : '.alobuild.yml';
