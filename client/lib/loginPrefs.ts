const KEY_SAVED_USERNAME = 'login.savedUsername';
const KEY_AUTO_LOGIN = 'login.autoLogin';

export type LoginPrefs = {
  savedUsername: string;
  autoLogin: boolean;
};

export function loadLoginPrefs(): LoginPrefs {
  if (typeof window === 'undefined') {
    return { savedUsername: '', autoLogin: false };
  }
  return {
    savedUsername: window.localStorage.getItem(KEY_SAVED_USERNAME) ?? '',
    autoLogin: window.localStorage.getItem(KEY_AUTO_LOGIN) === '1',
  };
}

export function persistLoginPrefs(input: {
  username: string;
  saveId: boolean;
  autoLogin: boolean;
}) {
  if (typeof window === 'undefined') return;
  if (input.saveId && input.username) {
    window.localStorage.setItem(KEY_SAVED_USERNAME, input.username);
  } else {
    window.localStorage.removeItem(KEY_SAVED_USERNAME);
  }
  if (input.autoLogin) {
    window.localStorage.setItem(KEY_AUTO_LOGIN, '1');
  } else {
    window.localStorage.removeItem(KEY_AUTO_LOGIN);
  }
}

export function clearAutoLogin() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY_AUTO_LOGIN);
}
