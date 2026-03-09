export interface ConfigBaseProps {
  catchErrors: 'always' | 'dev' | 'prod' | 'never';
  exitRoutes: string[];
  GOOGLE_API_KEY: string;
}

const BaseConfig: ConfigBaseProps = {
  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: 'always',

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ['Home', 'Login'],

  /**
   * Google Map API Key to fetch google map data
   */
  GOOGLE_API_KEY: '',
};

export default BaseConfig;
