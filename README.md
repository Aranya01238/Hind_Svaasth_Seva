# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Auth0 setup for Super Admin Portal

Create a `.env` file in the project root with:

```sh
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_api_identifier_optional
VITE_AUTH0_REDIRECT_URI=https://hssfinal.vercel.app
```

Then start the app using:

```sh
npm run dev
```

The `/admin` route is now protected and requires Auth0 login.

## Private Google Sheets via Apps Script (recommended)

If you do not want to set Google Sheets to "Anyone with link", use an Apps Script proxy.

1. Open script editor from your spreadsheet: `Extensions -> Apps Script`
2. Paste [apps-script/Code.gs](apps-script/Code.gs)
3. Update in script:
   - `SPREADSHEET_ID`
   - `API_KEY`
   - `SHEETS` names to match exact tab names in your file (current defaults: `Patients`, `Hospitals`, `Doctors`, `Beds`, `BloodBank`, `Equipment`, `Appointments`)
4. Deploy: `Deploy -> New deployment -> Web app`
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Add env values:

```sh
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_APPS_SCRIPT_API_KEY=CHANGE_ME_STRONG_RANDOM_KEY
```

With this setup, sheet data is read/written via Apps Script endpoint and the sheet itself stays private.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
