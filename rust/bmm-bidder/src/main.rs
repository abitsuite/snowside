use clap::{Parser, Subcommand};
use tracing_subscriber::EnvFilter;

/// BMM Bidder — Blind Merged Mining bidder and settlement monitor for Snowside L1
#[derive(Parser)]
#[command(name = "bmm-bidder")]
#[command(version = "0.1.0")]
#[command(about = "Submits BMM Requests to eCash and monitors settlement status", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run the BMM bidder daemon (monitors precompile, submits BMM Requests)
    Run {
        /// Path to configuration file
        #[arg(short, long, default_value = "config.toml")]
        config: String,
    },
    /// Check current settlement status from the precompile
    Status {
        /// RPC endpoint for the Snowside L1
        #[arg(long, default_value = "http://localhost:9650/ext/bc/snowside/rpc")]
        rpc: String,
    },
    /// Submit a manual BMM Request (for testing)
    Submit {
        /// RPC endpoint for the eCash L1
        #[arg(long, default_value = "http://localhost:8332")]
        ecash_rpc: String,
    },
}

fn main() -> anyhow::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let cli = Cli::parse();

    match &cli.command {
        Commands::Run { config } => {
            tracing::info!("Starting BMM bidder daemon with config: {}", config);
            // TODO: Load config, connect to Snowside RPC, monitor precompile events
            tracing::info!("BMM bidder daemon not yet implemented");
        }
        Commands::Status { rpc } => {
            tracing::info!("Checking settlement status at: {}", rpc);
            // TODO: Call getSettlementStatus() on the BMM precompile
            tracing::info!("Status check not yet implemented");
        }
        Commands::Submit { ecash_rpc } => {
            tracing::info!("Submitting manual BMM Request to: {}", ecash_rpc);
            // TODO: Construct and broadcast BMM Request transaction
            tracing::info!("Manual submit not yet implemented");
        }
    }

    Ok(())
}
