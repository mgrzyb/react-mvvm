export class AuthContext {
  user: string | undefined;

  constructor() {
    const s = window.localStorage.getItem("AuthContext");
    if (!s)
      return;
    const a = JSON.parse(s);
    this.user = a.user;
  }

  async signIn(userName: string) {
    await delay(1000);
    this.user = userName;
    window.localStorage.setItem("AuthContext", JSON.stringify({user: this.user}));
  }
}

function delay(ms : number) {
  return new Promise((r) => setTimeout(r, ms));
}
