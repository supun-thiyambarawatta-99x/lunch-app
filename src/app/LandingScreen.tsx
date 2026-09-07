export function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="landing-accountant">
      <div className="landing-header">
        <p className="landing-subtitle">OFFICE LUNCH MANAGEMENT SYSTEM</p>
        <h1 className="landing-title">LUNCH LEDGER</h1>
      </div>

      <div className="desk-scene-container">
        {/* Floating food & grocery items in 3D orbit */}
        <div className="floating-items-container">
          <div className="floating-item float-1" title="Fresh Broccoli">🥦</div>
          <div className="floating-item float-2" title="Carrot">🥕</div>
          <div className="floating-item float-3" title="Apple">🍎</div>
          <div className="floating-item float-4" title="Avocado">🥑</div>
          <div className="floating-item float-5" title="Sweet Corn">🌽</div>
          <div className="floating-item float-6" title="Bento Parcel">🍱</div>
          <div className="floating-item float-7" title="Takeout Box">🥡</div>
          <div className="floating-item float-8" title="Rice Bowl">🍚</div>
          <div className="floating-item float-9" title="Grocery Bag">🛍️</div>
          <div className="floating-item float-10" title="Receipt">🧾</div>
          <div className="floating-item float-11" title="Abacus">🧮</div>
          <div className="floating-item float-12" title="Plate">🍽️</div>
        </div>

        {/* 3D Isometric Accountant Desk Scene */}
        <div className="desk-stage">
          {/* Chef Accountant Character */}
          <div className="accountant-character">
            {/* Chef Toque / Hat */}
            <div className="chef-hat">
              <div className="chef-hat-puff" />
              <div className="chef-hat-band" />
            </div>

            {/* Head */}
            <div className="accountant-head">
              <div className="accountant-glasses">
                <span className="glass-lens left-lens" />
                <span className="glass-bridge" />
                <span className="glass-lens right-lens" />
              </div>
              <div className="accountant-eyes">
                <span className="eye eye-left" />
                <span className="eye eye-right" />
              </div>
              <div className="accountant-blush blush-left" />
              <div className="accountant-blush blush-right" />
              <div className="accountant-smile" />
            </div>

            {/* Body / Chef Jacket */}
            <div className="accountant-body">
              <div className="chef-buttons">
                <span className="btn-dot" />
                <span className="btn-dot" />
              </div>
            </div>

            {/* Arm tapping calculator */}
            <div className="accountant-arm arm-tapping" />
          </div>

          {/* Desk & Tools */}
          <div className="accountant-desk">
            <div className="desk-top">
              {/* Ledger Book */}
              <div className="desk-ledger">
                <div className="ledger-cover">
                  <div className="ledger-page">
                    <span className="ledger-line" />
                    <span className="ledger-line short" />
                    <span className="ledger-line" />
                  </div>
                </div>
              </div>

              {/* Little Calculator */}
              <div className="desk-calculator">
                <div className="calc-screen">14</div>
                <div className="calc-keys">
                  <span className="key" />
                  <span className="key" />
                  <span className="key" />
                  <span className="key active-key" />
                </div>
              </div>

              {/* Desk Stamp & Coffee Cup */}
              <div className="desk-cup">☕</div>
            </div>
            <div className="desk-legs">
              <div className="leg leg-left" />
              <div className="leg leg-right" />
            </div>
          </div>
        </div>
      </div>

      <div className="landing-actions">
        <button
          className="start-button-cinematic"
          data-testid="landing-start-button"
          onClick={onStart}
        >
          START WORKSPACE
        </button>
        <p className="landing-hint">PRESS START TO MANAGE LUNCH & BALANCES</p>
      </div>
    </div>
  );
}

