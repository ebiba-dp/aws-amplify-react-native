var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import * as React from 'react';
import { Linking } from 'react-native';

import { Logger, Hub } from '@aws-amplify/core';
import { default as Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';

const logger = new Logger('withOAuth');

export default (Comp => {
	let listeners = [];

	return class WithOAuth extends React.Component {
		constructor(props) {
			super(props);
			this._isMounted = false;
			const config = this._getOAuthConfig();

			const { urlOpener = defaultUrlOpener } = config;

			this.urlOpener = urlOpener;

			this.hostedUISignIn = this.hostedUISignIn.bind(this);
			this.signOut = this.signOut.bind(this);
			this.urlOpener = this.urlOpener.bind(this);

			this.state = {
				user: null,
				error: null,
				loading: false
			};

			listeners.forEach(listener => Hub.remove('auth', listener));
			listeners = [this];
			this.onHubCapsule = this.onHubCapsule.bind(this);
			Hub.listen('auth', this.onHubCapsule);
		}

		componentDidMount() {
			this._isMounted = true;
			this.setState({ loading: true }, () => {
				Auth.currentAuthenticatedUser().then(user => {
					this.setState({ user, loading: false });
				}).catch(error => {
					logger.debug(error);
					this.setState({ user: null, loading: false });
				});
			});
		}
		componentWillUnmount() {
			this._isMounted = false;
			return;
		}
		onHubCapsule(capsule) {
			// The Auth module will emit events when user signs in, signs out, etc
			if (!this._isMounted) return;
			const { channel, payload } = capsule;

			if (channel === 'auth') {
				switch (payload.event) {
					case 'signIn':
					case 'cognitoHostedUI':
						{
							Auth.currentAuthenticatedUser().then(user => {
								logger.debug('signed in');
								this.setState({ user, error: null, loading: false });
							});
							break;
						}
					case 'signOut':
						{
							logger.debug('signed out');
							this.setState({ user: null, error: null, loading: false });
							break;
						}
					case 'signIn_failure':
					case 'cognitoHostedUI_failure':
						{
							logger.debug('not signed in');
							this.setState({
								user: null,
								error: decodeURIComponent(payload.data),
								loading: false
							});
							break;
						}
					default:
						break;
				}
			}
		}

		_getOAuthConfig() {
			if (!Auth || typeof Auth.configure !== 'function') {
				throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
			}

			const { oauth = undefined } = Auth.configure();

			// to keep backward compatibility
			const cognitoHostedUIConfig = oauth && (oauth.domain ? oauth : oauth.awsCognito);
			const config = this.props.oauth_config || cognitoHostedUIConfig;

			return config;
		}

		hostedUISignIn(provider) {
			this.setState({ loading: true }, () => Auth.federatedSignIn({ provider }));
		}

		signOut() {
			return Auth.signOut().catch(error => logger.warn(error));
		}

		render() {
			const { user: oAuthUser, error: oAuthError, loading } = this.state;
			const _props = this.props,
			      { oauth_config: _ } = _props,
			      otherProps = _objectWithoutProperties(_props, ['oauth_config']);

			const oAuthProps = {
				loading,
				oAuthUser,
				oAuthError,
				hostedUISignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Cognito),
				facebookSignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Facebook),
				amazonSignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Amazon),
				googleSignIn: this.hostedUISignIn.bind(this, CognitoHostedUIIdentityProvider.Google),
				customProviderSignIn: provider => this.hostedUISignIn(provider),
				signOut: this.signOut
			};

			return React.createElement(Comp, _extends({}, oAuthProps, otherProps));
		}
	};
});

const defaultUrlOpener = (url, redirectUrl) => {
	logger.debug(`opening url: ${url}, redirectUrl: ${redirectUrl}`);

	return Linking.openURL(url);
};