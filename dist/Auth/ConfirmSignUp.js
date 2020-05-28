/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import { FormField, LinkCell, Header, ErrorRow, AmplifyButton, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece from './AuthPiece';
import TEST_ID from '../AmplifyTestIDs';

const logger = new Logger('ConfirmSignUp');

export default class ConfirmSignUp extends AuthPiece {
	constructor(props) {
		super(props);

		this._validAuthStates = ['confirmSignUp'];
		this.state = {
			username: null,
			code: null,
			error: null,
			loading: false
		};

		this.confirm = this.confirm.bind(this);
		this.resend = this.resend.bind(this);
	}

	confirm() {
		const { code } = this.state;
		this.setState({loading: true});
		const username = this.getUsernameFromInput();
		logger.debug('Confirm Sign Up for ' + username);
		Auth.confirmSignUp(username, code).then(data => {
			this.changeState('signedUp')
			this.setState({loading: false});
		}).catch(err => {
			this.error(err)
			this.setState({loading: false});
		});
	}

	resend() {
		const username = this.getUsernameFromInput();
		logger.debug('Resend Sign Up for ' + username);
		Auth.resendSignUp(username).then(() => logger.debug('code sent')).catch(err => this.error(err));
	}

	static getDerivedStateFromProps(props, state) {
		const username = props.authData;

		if (username && !state.username) {
			return { username };
		}

		return null;
	}

	showComponent(theme) {
		const username = this.getUsernameFromInput();
		return React.createElement(
			Wrapper,
			null,
			React.createElement(
				View,
				{ style: theme.section },
				React.createElement(
					View,
					null,
					React.createElement(
						Header,
						{ theme: theme, testID: TEST_ID.AUTH.CONFIRM_SIGN_UP_TEXT },
						I18n.get('Confirm Sign Up')
					),
					React.createElement(
						View,
						{ style: theme.sectionBody },
						this.renderUsernameField(theme),
						React.createElement(FormField, {
							theme: theme,
							onChangeText: text => this.setState({ code: text }),
							label: I18n.get('Confirmation Code'),
							placeholder: I18n.get('Enter your confirmation code'),
							required: true,
							testID: TEST_ID.AUTH.CONFIRMATION_CODE_INPUT
						}),
						React.createElement(AmplifyButton, {
							theme: theme,
							text: this.state.loading ? <ActivityIndicator color="#fff" size="small" style={{width: 10, height: 20}} /> : I18n.get('Confirm'),
							onPress: this.confirm,
							disabled: !username || !this.state.code,
							testID: TEST_ID.AUTH.CONFIRM_BUTTON
						})
					),
					React.createElement(
						View,
						{ style: theme.sectionFooter },
						React.createElement(
							LinkCell,
							{
								theme: theme,
								onPress: this.resend,
								disabled: !this.state.username,
								testID: TEST_ID.AUTH.RESEND_CODE_BUTTON
							},
							I18n.get('Resend code')
						),
						React.createElement(
							LinkCell,
							{
								theme: theme,
								onPress: () => this.changeState('signIn'),
								testID: TEST_ID.AUTH.BACK_TO_SIGN_IN_BUTTON
							},
							I18n.get('Back to Sign In')
						)
					),
					React.createElement(
						ErrorRow,
						{ theme: theme },
						this.state.error
					)
				),
				React.createElement(SignedOutMessage, this.props)
			)
		);
	}
}