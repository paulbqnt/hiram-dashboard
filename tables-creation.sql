-- Create Assets table (base table for all instruments)
CREATE TABLE assets (
                        asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'option', 'bond')),
                        ticker TEXT NOT NULL,
                        name TEXT NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Stocks table
CREATE TABLE stocks (
                        stock_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        asset_id INTEGER NOT NULL,
                        current_price REAL NOT NULL,
                        sector TEXT,
                        market_cap REAL,
                        dividend_yield REAL,
                        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

-- Create Options table
CREATE TABLE options (
                         option_id INTEGER PRIMARY KEY AUTOINCREMENT,
                         asset_id INTEGER NOT NULL,
                         underlying_asset_id INTEGER NOT NULL,
                         strike_price REAL NOT NULL,
                         expiration_date DATE NOT NULL,
                         option_type TEXT NOT NULL CHECK (option_type IN ('call', 'put')),
                         contract_size INTEGER DEFAULT 100,
                         last_price REAL,
                         FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
                         FOREIGN KEY (underlying_asset_id) REFERENCES assets(asset_id)
);

-- Create Portfolios table
CREATE TABLE portfolios (
                            portfolio_id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            name TEXT NOT NULL,
                            description TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Portfolio_Positions table
CREATE TABLE portfolio_positions (
                                     position_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     portfolio_id INTEGER NOT NULL,
                                     asset_id INTEGER NOT NULL,
                                     quantity REAL NOT NULL,
                                     entry_price REAL NOT NULL,
                                     entry_date DATE DEFAULT CURRENT_DATE,
                                     notes TEXT,
                                     FOREIGN KEY (portfolio_id) REFERENCES portfolio_positions(portfolio_id) ON DELETE CASCADE,
                                     FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

-- Create Bonds table for future use
CREATE TABLE bonds (
                       bond_id INTEGER PRIMARY KEY AUTOINCREMENT,
                       asset_id INTEGER NOT NULL,
                       face_value REAL NOT NULL,
                       coupon_rate REAL NOT NULL,
                       issue_date DATE NOT NULL,
                       maturity_date DATE NOT NULL,
                       issuer TEXT NOT NULL,
                       credit_rating TEXT,
                       FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

-- Create indices for better query performance
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_options_underlying ON options(underlying_asset_id);
CREATE INDEX idx_portfolio_positions ON portfolio_positions(portfolio_id, asset_id);
