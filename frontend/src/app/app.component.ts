import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-shell">
      <nav class="navbar">
        <div class="nav-brand">
          <span class="nav-icon">⬡</span>
          <span class="nav-title">NEXUS <span class="nav-subtitle">TICKETING</span></span>
        </div>
        <div class="nav-links">
          <a routerLink="/tickets" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <span class="link-icon">▦</span> All Tickets
          </a>
          <a routerLink="/tickets/new" routerLinkActive="active" class="nav-link nav-link-cta">
            <span class="link-icon">＋</span> New Ticket
          </a>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #080c14;
    }

    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 64px;
      background: rgba(8, 12, 20, 0.95);
      border-bottom: 1px solid rgba(0, 212, 255, 0.15);
      backdrop-filter: blur(12px);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .nav-icon {
      font-size: 1.5rem;
      color: #00d4ff;
      filter: drop-shadow(0 0 8px #00d4ff);
    }

    .nav-title {
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: #e8f4f8;
    }

    .nav-subtitle {
      color: #00d4ff;
      opacity: 0.7;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1.25rem;
      border-radius: 4px;
      text-decoration: none;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #8aa5b5;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .nav-link:hover, .nav-link.active {
      color: #00d4ff;
      border-color: rgba(0, 212, 255, 0.3);
      background: rgba(0, 212, 255, 0.05);
    }

    .nav-link-cta {
      border-color: rgba(0, 212, 255, 0.4);
      color: #00d4ff;
      background: rgba(0, 212, 255, 0.08);
    }

    .nav-link-cta:hover {
      background: rgba(0, 212, 255, 0.15);
      box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
    }

    .link-icon {
      font-size: 0.9rem;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class AppComponent {
  title = 'Nexus Ticketing';
}
