use base58::ToBase58;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize, Clone)]
pub struct Tenant {
    #[serde(skip)]
    pub id: i64,
    #[serde(skip)]
    pub app_id: i64,
    pub github_login: String,
    pub github_id: i64,
    pub block_list: String,
}

#[derive(Serialize)]
pub struct UserTenant {
    #[serde(flatten)]
    tenant: Tenant,
    app_key: String,
    callback_url: String,
}

impl From<Tenant> for UserTenant {
    fn from(t: Tenant) -> Self {
        let app_key = t.app_id.to_le_bytes().to_base58();
        let domain = env::var("pipehub_domain").unwrap();
        let callback_url = format!("{}/send/{}", domain, app_key);
        UserTenant {
            tenant: t,
            app_key,
            callback_url,
        }
    }
}

impl Tenant {
    pub fn new(app_id: i64, github_login: String, github_id: i64) -> Self {
        Tenant {
            id: i64::default(),
            app_id,
            github_login,
            github_id,
            block_list: "".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Default)]
pub struct WechatWork {
    #[serde(skip)]
    pub id: i64,
    #[serde(skip)]
    pub tenant_id: i64,
    pub corp_id: String,
    pub agent_id: i64,
    pub secret: String,
}
