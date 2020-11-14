import PianoOAuth from "react-native-piano-oauth";
import PianoComposer from "react-native-piano-composer";
import { Platform, NativeModules, DeviceEventEmitter } from "react-native";
import { createApi, post } from "./fetch";

const API_VERSION = "/api/v3";

const API = {
  PUBLISHER_USER_GET: `${API_VERSION}/publisher/user/get`,
};

const PianoSdkModule = NativeModules.PianoSdk;

export const ENDPOINT = {
  SANDBOX: "https://sandbox.tinypass.com/",
  PRODUCTION: "https://buy.tinypass.com/",
  PRODUCTION_ASIA_PACIFIC: "https://buy-ap.piano.io/",
  PRODUCTION_AUSTRALIA: "https://buy-au.piano.io/",
};

const PianoSdk = {
  /**
   * The function init(). Initialize ID and Composer
   *
   * @param {string} aid - The Application ID
   * @param {string} endpoint - The Endpoint
   * @param {string} [facebookAppId=null] - Facebook App Id required for native Facebook sign on
   */
  init(aid: string, endpoint: string, facebookAppId: string = null) {
    createApi(endpoint);
    if (Platform.OS === "android") {
      PianoSdkModule.init(aid, endpoint, facebookAppId);
    }
  },

  /**
   * Callback that handles the response
   *
   * @callback responseCallback
   * @param {*} response - The callback that handles the response
   */

  /**
   * The function signIn(). Sign in ID and it will return activeToken in a callback which can then be used through the application.
   *
   * @param {responseCallback} [callback=() => {}] - A callback to run
   */
  signIn(callback = () => {}) {
    try {
      if (Platform.OS === "android") {
        PianoSdkModule.signIn(callback);
      } else {
        PianoOAuth.signInWithAID(
          "wO1jb8cssu",
          ENDPOINT.SANDBOX,
          0,
          (token, error) => {
            if (error) {
              callback(error);
            } else if (token) {
              callback({ accessToken: token });
            }
          },
          () => {
            callback("Login cancelled");
          }
        );
      }
    } catch (err) {
      callback(err);
    }
  },

  /**
   * The function signOut(). Sign out ID.
   *
   * @param {string} [accessToken=null]
   * @param {responseCallback} [callback=() => {}] - A callback to run
   */
  signOut(accessToken: string = null, callback: Function = () => {}) {
    try {
      if (Platform.OS === "android") {
        PianoSdkModule.signOut(accessToken, callback);
      } else {
        PianoOAuth.signOutWithToken(accessToken);
        callback();
      }
    } catch (err) {
      callback(err);
    }
  },

  /**
   * The function refreshToken(). Refresh token.
   *
   * @param {string} accessToken
   * @param {responseCallback} [callback=() => {}] - A callback to run
   */
  refreshToken(accessToken: string, callback: Function = () => {}) {
    if (Platform.OS === "android") {
      PianoSdkModule.refreshToken(accessToken, callback);
    }
  },

  /**
   * The function setUserToken(). Set Composer user token
   *
   * @param {string} accessToken
   */
  setUserToken(accessToken: string) {
    if (Platform.OS === "android") {
      PianoSdkModule.setUserToken(accessToken);
    }
  },

  /**
   * The function getUser(). Gets a user details.
   *
   * @param {string} aid - The Application ID
   * @param {string} uid - User's UID
   * @param {string} api_token - The API Token
   * @returns User's first_name, last_name, email, personal_name, uid, image1, create_date, reset_password_email_sent, custom_fields
   */
  getUser(aid: string, uid: string, api_token: string) {
    return post(API.PUBLISHER_USER_GET, { aid, uid, api_token });
  },

  /**
   * The function getExperience(). It's Piano Experience :D
   *
   * @param {*} config
   * @param {responseCallback} [callback=() => {}] - A callback to run
   */
  getExperience(config: {}, callback: Function = () => {}) {
    if (Platform.OS === "android") {
      PianoSdkModule.getExperience(JSON.stringify(config), callback);
      const subscription = DeviceEventEmitter.addListener(
        "ShowLoginListener",
        (e) => {
          callback("ShowLoginListener");
        }
      );
      return subscription;
    } else {
      PianoComposer.execute(
        config.aid,
        config.debug,
        config.tags,
        config.zone,
        config.referrer,
        config.url,
        config.contentAuthor,
        config.contentCreated,
        config.contentSection,
        config.customVariables,
        config.userToken,
        config.showLoginHandler,
        config.showTemplateHandler
      );
    }
  },
};

export default PianoSdk;
