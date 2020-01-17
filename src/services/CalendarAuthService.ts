import * as fs from "fs";
import readline from "readline";
import { OAuth2Client } from "google-auth-library";
import { google, calendar_v3 } from "googleapis";
import * as util from "util";

const readFile = util.promisify(fs.readFile);
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "token.json";

export class CalendarAuthService {
  private client?: OAuth2Client;

  public getCalendar(): Promise<calendar_v3.Calendar> {
    return this.authorizedClient().then(client => {
      const calendar = google.calendar({ version: "v3", auth: client });
      return calendar;
    });
  }

  public authorizedClient(): Promise<OAuth2Client> {
    return this.getClient()
      .then(oAuth2Client => {
        if (this.hasFile(TOKEN_PATH)) {
          return readFile("token.json").then(token => {
            oAuth2Client.setCredentials(JSON.parse(token.toString()));
            return oAuth2Client;
          });
        } else {
          return this.setAccessToken();
        }
      })
      .catch(err => {
        console.log("Authentication error:", err);
        throw err;
      });
  }

  private getClient(): Promise<OAuth2Client> {
    if (this.client) {
      return new Promise(resolve => resolve(this.client));
    }
    return readFile("credentials.json")
      .then(credentials => {
        const { client_secret, client_id, redirect_uris } = JSON.parse(
          credentials.toString()
        ).installed;
        const oAuth2Client = new google.auth.OAuth2(
          client_id,
          client_secret,
          redirect_uris[0]
        );
        this.client = oAuth2Client;
        return oAuth2Client;
      })
      .catch(err => {
        console.log("Authentication error:", err);
        throw err;
      });
  }

  private setAccessToken(): Promise<OAuth2Client> {
    return this.getClient().then(oAuth2Client => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES
      });
      console.log("Authorize this app by visiting this url:", authUrl);
      const promise = new Promise<OAuth2Client>((resolve, reject) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question("Enter the code from that page here: ", code => {
          rl.close();
          oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error("Error retrieving access token", err);
            oAuth2Client.setCredentials(token!);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
              if (err) return console.error(err);
              console.log("Token stored to", TOKEN_PATH);
            });
            resolve(oAuth2Client);
          });
        });
      });
      return promise;
    });
  }

  private hasFile(filePath: string): boolean {
    try {
      fs.statSync(filePath);
      return true;
    } catch (_err) {
      return false;
    }
  }
}
