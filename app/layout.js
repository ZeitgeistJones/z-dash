import Providers from "./providers";

export const metadata = {
  title: "z-dash",
  description: "Cohort dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('zdash-theme');
                  if (saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --bg: #ffffff;
                --bg-subtle: #f7f7f5;
                --bg-muted: #f3f2ee;
                --border: #e0e0e0;
                --border-strong: #ccc;
                --text: #333333;
                --text-muted: #555555;
                --text-faint: #888888;
                --text-xfaint: #aaaaaa;
                --pill-bg: #f3f2ee;
                --pill-border: #e0e0e0;
                --pill-text: #444444;
                --pill-label: #888888;
                --pill-value: #222222;
                --table-hover: rgba(0,0,0,0.02);
                --clawd-row-bg: rgba(59,109,17,0.05);
                --clawd-row-border: #3B6D11;
                --btn-active-bg: #333333;
                --btn-active-text: #ffffff;
                --btn-inactive-bg: #ffffff;
                --btn-inactive-text: #333333;
                --btn-inactive-border: #cccccc;
                --badge-neutral-bg: #eceae3;
                --badge-neutral-text: #000000;
                --status-bg: #f7f7f5;
                --gate-ok-bg: #E1F5EE;
                --gate-ok-text: #085041;
                --gate-fail-bg: #FAECE7;
                --gate-fail-text: #712B13;
                --read-teal-bg: #E1F5EE;
                --read-teal-text: #085041;
                --read-amber-bg: #FAEEDA;
                --read-amber-text: #633806;
                --read-coral-bg: #FAECE7;
                --read-coral-text: #712B13;
                --summary-bar-bg: #f3f2ee;
                --summary-bar-border: #e0e0e0;
              }

              [data-theme="dark"] {
                --bg: #111111;
                --bg-subtle: #1a1a1a;
                --bg-muted: #222222;
                --border: #2e2e2e;
                --border-strong: #444444;
                --text: #e8e8e8;
                --text-muted: #aaaaaa;
                --text-faint: #777777;
                --text-xfaint: #555555;
                --pill-bg: #222222;
                --pill-border: #2e2e2e;
                --pill-text: #cccccc;
                --pill-label: #777777;
                --pill-value: #eeeeee;
                --table-hover: rgba(255,255,255,0.03);
                --clawd-row-bg: rgba(59,109,17,0.12);
                --clawd-row-border: #5a9e2f;
                --btn-active-bg: #e8e8e8;
                --btn-active-text: #111111;
                --btn-inactive-bg: #1a1a1a;
                --btn-inactive-text: #cccccc;
                --btn-inactive-border: #333333;
                --badge-neutral-bg: #2a2a2a;
                --badge-neutral-text: #dddddd;
                --status-bg: #1a1a1a;
                --gate-ok-bg: #0d2e26;
                --gate-ok-text: #6dcfb0;
                --gate-fail-bg: #2e1510;
                --gate-fail-text: #e8856a;
                --read-teal-bg: #0d2e26;
                --read-teal-text: #6dcfb0;
                --read-amber-bg: #2e1f08;
                --read-amber-text: #d4a055;
                --read-coral-bg: #2e1510;
                --read-coral-text: #e8856a;
                --summary-bar-bg: #1e1e1e;
                --summary-bar-border: #2e2e2e;
              }

              *, *::before, *::after { box-sizing: border-box; }

              body {
                background: var(--bg);
                color: var(--text);
                margin: 0;
                font-family: sans-serif;
                transition: background 0.2s, color 0.2s;
              }
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
