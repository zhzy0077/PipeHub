use crate::error::Result;
use config::{Config, Environment};
use log::Level;
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct PipeHubConfig {
    pub host: String,
    pub port: u16,
    pub domain: String,
    // If we need to make cookie secure.
    pub https: bool,
    pub database_url: String,
    pub github: GitHubConfig,
    pub log: LogConfig,
}

#[derive(Debug, Clone, Deserialize)]
pub struct GitHubConfig {
    pub client_id: String,
    pub client_secret: String,
    pub auth_url: String,
    pub token_url: String,
    pub callback_url: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LogConfig {
    #[serde(default)]
    pub instrumentation_key: String,
    #[serde(default)]
    pub log_dir: String,
    pub level: Level,
}

impl PipeHubConfig {
    pub fn new() -> Result<Self> {
        let environment = Environment::new().prefix("pipehub").separator("__");
        let mut config = Config::new();

        config.merge(environment)?;
        let config = config.try_into()?;

        Ok(config)
    }

    pub fn bind_addr(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}
