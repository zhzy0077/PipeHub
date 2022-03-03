import React, { useEffect, useState } from 'react';
import { Label, TextField, PrimaryButton, Separator, Text, DefaultButton, Callout, Stack, Checkbox, Icon, FontSizes } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { backend } from './Constants';
import Send from './Send';

function User() {
  const [user, setUser] = useState({} as UserEntity);
  const [wechat, setWechat] = useState({} as Wechat);
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);

  useEffect(() => {
    fetch(`${backend}/wechat`, {
      credentials: 'include'
    })
      .then(res => {
        return res.json();
      }).then((wechat: Wechat) => {
        setWechat(wechat);
      })
  }, []);

  useEffect(() => {
    fetch(`${backend}/user`, {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 401) {
          window.location.href = res.headers.get("Location") ?? "/";
        } else {
          return res.json();
        }
      }).then((entity: UserEntity) => {
        setUser(entity);
      })
  }, []);

  const update = () => {
    fetch(`${backend}/wechat`, {
      method: "PUT",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(wechat)
    })
      .then(res => {
        if (res.status < 400) {
          alert("Success");
        }
        return res.text();
      }).then(res => {
        console.log(res);
      });

    fetch(`${backend}/user`, {
      method: "PUT",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
      .then(res => {
        return res.text();
      }).then(res => {
        console.log(res);
      });
  };
  const resetKey = () => {
    toggleIsCalloutVisible();
    fetch(`${backend}/user/reset_key`, {
      method: "POST",
      credentials: 'include',
    })
      .then(res => {
        if (res.status < 400) {
          alert("Success");
        }
        return res.json();
      }).then((entity: UserEntity) => {
        setUser(entity);
      });
  }
  const onCorpIdChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
    setWechat({
      ...wechat,
      corp_id: newVal || '',
    });
  }
  const onAgentIdChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
    setWechat({
      ...wechat,
      agent_id: parseInt(newVal || '0'),
    });
  }
  const onSecretChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
    setWechat({
      ...wechat,
      secret: newVal || '',
    });
  }
  const onBlockListChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
    setUser({
      ...user,
      block_list: newVal || '',
    });
  }

  const onMicrosoftListIdChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
    setUser({
      ...user,
      msft_task_list_id: newVal || '',
    });
  }

  const onCaptchaChange = (event: React.FormEvent<HTMLInputElement | HTMLElement> | undefined, newVal?: boolean) => {
    setUser({
      ...user,
      captcha: newVal || false,
    });
  }
  const onBotTokenChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
    setWechat({
      ...wechat,
      telegram_bot_token: newVal || '',
    });
  }

  const onChatIdChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
    setWechat({
      ...wechat,
      telegram_chat_id: newVal || '',
    });
  }

  const msftLogin = () => {
    fetch(`${backend}/msft_auth_url`, {
      credentials: 'include'
    })
      .then(res => {
        window.location.href = res.headers.get("Location") ?? "/";
      })
  };

  return (
    <div>
      <Label>GitHub 账号</Label> <TextField readOnly value={user.github_login ?? ''}></TextField>
      <Label>App Key</Label> <TextField readOnly value={user.app_key ?? ''}></TextField>

      <Label>企业 ID</Label> <TextField onChange={onCorpIdChange} value={wechat.corp_id ?? ''}></TextField>
      <Label>Agent ID</Label> <TextField onChange={onAgentIdChange} value={wechat.agent_id ? wechat.agent_id.toString() : ""}></TextField>
      <Label>Secret</Label> <TextField onChange={onSecretChange} value={wechat.secret ?? ''}></TextField>
      <Label>Telegram Bot Token</Label> <TextField onChange={onBotTokenChange} value={wechat.telegram_bot_token ?? ''}></TextField>
      <Label>Telegram Chat Id</Label> <TextField onChange={onChatIdChange} value={wechat.telegram_chat_id ?? ''}></TextField>
      <Label>黑名单(使用英语逗号,分隔的一系列字符串, 如果消息包含任意一个, 将不会推送.)</Label> <TextField onChange={onBlockListChange} value={user.block_list ?? ''}></TextField>
      <Checkbox styles={{ root: { marginTop: '10px' } }} label='验证码检测(将较长的短信中的验证码提取在第一行显示)(Beta)' onChange={onCaptchaChange} checked={user.captcha ?? false} />
      <Label>Microsoft Todo List Id</Label> 
      <TextField onChange={onMicrosoftListIdChange} value={user.msft_task_list_id ?? ''}></TextField>
      <DefaultButton style={{ marginTop: '10px' }} text="Microsoft 登录" onClick={msftLogin}/> 
      { user.msft_refresh_token != "" && <Icon style={{ fontSize: FontSizes.icon, marginLeft: '5px' }} iconName="Accept" /> } <br/>
      <PrimaryButton style={{ marginTop: '10px' }} onClick={update}>更新</PrimaryButton>

      <DefaultButton
        style={{ marginLeft: '20px' }}
        onClick={toggleIsCalloutVisible}
        id="resetKey"
        text="重置 AppKey"
      />
      {isCalloutVisible ? (
        <div>
          <Callout
            style={{ width: '300px' }}
            target={`#resetKey`}
            onDismiss={toggleIsCalloutVisible}
            setInitialFocus
          >
            <div style={{ padding: '20px 24px 20px' }}>
              <Label>
                重置 App Key 后目前用来发送的 URL 会发生变化, 所有调用方都需要使用新的 URL. 确定要重置吗?
              </Label>

              <Stack style={{ marginTop: '20px' }} tokens={{ childrenGap: '8px' }} horizontal horizontalAlign="space-evenly">
                <PrimaryButton
                  onClick={resetKey}
                  text="确定"
                />
                <DefaultButton
                  onClick={toggleIsCalloutVisible}
                  text="取消"
                />
              </Stack>
            </div>
          </Callout>
        </div>
      ) : null}

      <Separator />
      <Text variant='xLarge'>您的 Callback URL 是: {user.callback_url}</Text>
      <Separator />
      <Send user={user} />
    </div>
  );
}

export interface UserEntity {
  github_login: string,
  github_id: number,
  app_key: string,
  callback_url: string,
  block_list: string,
  captcha: boolean,
  msft_refresh_token: string,
  msft_task_list_id: string,
}

export interface Wechat {
  corp_id: string,
  agent_id: number,
  secret: string,
  telegram_bot_token: string,
  telegram_chat_id: string,
}

export default User;
