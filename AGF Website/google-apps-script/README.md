# Quote form → Google Sheet + email

Each quote request from the website becomes a row in a Google Sheet, and an email alert goes to benedict@johnfoundation.org (set by `NOTIFY_EMAIL` at the top of `Code.gs`).

## One-time setup (about 5 minutes)

The Google account you're signed in to while doing this owns the sheet and is the account the alert emails are sent from.

1. Go to sheets.google.com and create a blank sheet. Name it something like **AGF Quote Requests**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the starter code in `Code.gs`, paste in everything from `Code.gs` in this folder, and click **Save**.
   Then choose **setup** in the function dropdown on the toolbar and click **Run** to grant permissions (see step 5 for the warning screen). If you get "Access blocked: The OAuth client is not fully created yet", the new project isn't ready yet; wait 5–10 minutes and run it again.
4. Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy**.
5. Google will ask you to authorise the script. Choose your account. On the "Google hasn't verified this app" screen, click **Advanced → Go to (project name) (unsafe)**, then **Allow**. This warning is normal for your own scripts.
6. Copy the **Web app URL** (it ends in `/exec`).
7. In `index.html`, replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with that URL, then publish the site.

A "Quote Requests" tab with a header row is created automatically when the first enquiry arrives.

## Changing the script later

If you edit `Code.gs`, go to **Deploy → Manage deployments → ✏️ Edit**, set **Version** to **New version**, and click **Deploy**. This keeps the same URL, so the website doesn't need changing. (Choosing "New deployment" instead creates a new URL.)
