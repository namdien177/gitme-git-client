import { Injectable } from '@angular/core';
import * as passport from 'passport';
import * as passportGithub from 'passport-github';

const passportGitHubStrategy = passportGithub.Strategy;

@Injectable({
  providedIn: 'root'
})
export class PassportService {

  constructor() {
    passport.use(new passportGitHubStrategy({
        clientID: 'GITHUB_CLIENT_ID',
        clientSecret: 'GITHUB_CLIENT_SECRET',
        callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
      },
      function (accessToken, refreshToken, profile, cb) {
        // User.findOrCreate({ githubId: profile.id }, function (err, user) {
        //   return cb(err, user);
        // });
      }
    ));
  }
}
