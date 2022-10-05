import { catchError } from "../common";
import jwt from 'jsonwebtoken';
import coraline from "../../database/coraline";

const serviceAccounts = {
    getAccessToken: async (filename: string) => {
        try {
            const scope = 'https://www.googleapis.com/auth/cloud-translation';
            const token = jwt.sign({
                iss: "527300585899-compute@developer.gserviceaccount.com",
                scope,
                aud: "https://oauth2.googleapis.com/token",
            }, "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDY34C7vrbpeGow\nTnQpQrPUhfn31mfgUq9om7S4jVLnst73nE5K8n75eIDRsowStnWYj1Wn+ZoZjaWH\nKtBLO4fU4WAOt9n1jP12lnyYAoj+u4y0/hhNVYYdk4cCGyFreTDHDFOy6A5Zcd27\nqzVNOohdmBNBhRaMnKWXveRwHOQZjCTYr7jgZv3RVaGSG/br5y4ikmC0HQFe84l+\nhJCEHH66yLGv33TQj4pHyrV3FdCM+RY9Ktp4XOz8crhKBuU9d8fMdU0mk8Y9TuRY\n8DfGNNsOX97gILuAWpxdeDxgqTm9OhRrvPMFRVqS44uoy6245vSGk3uyUJt3SJTX\n43A/1NARAgMBAAECggEAAS8jOaMzxiLmrYctd4Y04NMEcjfPpGK/MMUyNOnB9fWS\nOxbgOeTeEEhPUmsfpwCBCYlgJdp6iWuDvQZc/HQsQdt4gKFnWsG00T9xbwu11MeQ\nX/KdOQWKWxdRnuTSsg6yLKa4FEYpFzrvGNW5T50jXnjJ7iB8Zt3PbPyCm/bEa2ad\nE4H8SQqB1M5ApiiZx6kRjNNwDDY2lTaulbsK1bElms5wdq04MYtQdjjX3qYZAzY1\nx06rEaLTCOElXU3c/CpKpUovuRebUY6g2L3PtGerokKafjlgPD3P8njyE466hLFn\nph27DtGcjoR+aOMyLJZzWBtop7HU0Jxh2+S+GC1ruQKBgQD+v5QxYppRpdJX3Me5\nDd+Utj9FslyzGTaoD/NFdStXZ3cBxcA8Ow5kfql2LlYMMcekspTw+gu1uebi12J0\nBzuR8Pl8GuGeCa0865ygTbEy1zL46EkkscO6vsWJKhyAgXJx1vIDihuFAJe6G/b2\ngLw4jl7+YSBRD/uW0aEmpQJ+fQKBgQDZ8EjeKDeZdu3q3CP+uUtLR5vPiuywdMQP\nR/aY3wWwPfG/VRCl2qflIjgxsmpl0ayAjXw+4yXuJEAQRFXHKSjpAtUdg+N3I1WH\n7DMyrkKGwoMLSwsgzGi4oy++a0W5SiSiFtikcjf+QgOdDUq3IrwDO0Xy7d/rLNpt\njSlgMpkoJQKBgQDAPHOo/L51JIvhT7LLe6OfhhOjFaCMaldrZXXvkSaes24DwWV6\nThpjTY21p+u5EguUxkpMunQBs4J+5YffBOI4FD9AHszoxGadVTMBaP9x3SES4b7o\nWNjZ4EISatvNQWHKdCh28U4pBLR6dcXcaHMgvpcCoOqRIV16h0BzeAu0xQKBgQC5\n98sGHwVKo+xi85SXgJ/aTfGLyP0tmYXPkFXBntVozYLjBIBfNlT8NhYDej5GQgPT\n8mdp9kRgkHhGKTmU5+9r3anjNK69893BTXFmtsI34fUWhuOpCiP2IfHUqA7oDHd0\nBNC6imhzQvt4YWY3HaGXlFWc9RSUxkJhJwp+ds6wLQKBgELkxG4z4P5WFbEUIS8O\nZFic9yH1eJaj63IoSDuC/+h6gQGsqrfAGFcXC7RNvRsB800k2z5SbeipRIln0MDS\n445/ZGI0thyRXa1whBQ2AcxGYcoRta7519LK4jWc4xpQZZi3er5JWD+cfgWVT/or\nw5KBMaHcCkg4Hn+11bcOtuHm\n-----END PRIVATE KEY-----\n", {
                algorithm: 'RS256',
                expiresIn: '3600s',
                header: {
                    alg: "RS256",
                    typ: "JWT",
                    kid: "434af11ff45c6ff6e941b00ff44fe7b2313323b4"
                }
            })
            const query = new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token
            }).toString();
            const res = await fetch(`https://oauth2.googleapis.com/token?${query}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(JSON.stringify(data));
            } else {
                await coraline.saveJSON(filename, data);
                const credentials = await coraline.readJSON(filename)
                return credentials as Credentials;
            }
        } catch (err) {
            throw catchError(err);
        }
    }
}

export default serviceAccounts;