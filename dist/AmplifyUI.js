var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

import React, { Component } from 'react';
import { Keyboard, Picker, Platform, Text, TextInput, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View, SafeAreaView } from 'react-native';
import { I18n } from 'aws-amplify';
import AmplifyTheme, { linkUnderlayColor, errorIconColor, placeholderColor } from './AmplifyTheme';
import { Icon } from 'react-native-elements';
import countryDialCodes from './CountryDialCodes';
import TEST_ID from './AmplifyTestIDs';

export const Container = props => {
	const theme = props.theme || AmplifyTheme;
	return React.createElement(
		SafeAreaView,
		{ style: theme.container },
		props.children
	);
};

export const FormField = props => {
	const theme = props.theme || AmplifyTheme;
	return React.createElement(
		View,
		{ style: theme.formField },
		React.createElement(
			Text,
			{ style: theme.inputLabel },
			props.label,
			' ',
			props.required ? '*' : ''
		),
		React.createElement(TextInput, _extends({
			style: theme.input,
			autoCapitalize: 'none',
			autoCorrect: false,
			placeholderTextColor: placeholderColor
		}, props))
	);
};

export class PhoneField extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dialCode: this.props.defaultDialCode || '+1',
			phone: ''
		};
	}

	onChangeText() {
		const { dialCode, phone } = this.state;
		const cleanedPhone = phone.replace(/[^0-9.]/g, '') || '';
		const phoneNumber = cleanedPhone === '' ? '' : `${dialCode}${cleanedPhone}`;
		this.props.onChangeText(phoneNumber);
	}

	render() {
		const { label, required, value } = this.props;
		const { dialCode } = this.state;
		const theme = this.props.theme || AmplifyTheme;

		const phoneValue = value ? value.replace(dialCode, '') : undefined;

		return React.createElement(
			View,
			{ style: theme.formField },
			React.createElement(
				Text,
				{ style: theme.inputLabel },
				label,
				' ',
				required ? '*' : ''
			),
			React.createElement(
				View,
				{ style: theme.phoneContainer },
				React.createElement(
					Picker,
					{
						style: theme.picker,
						selectedValue: this.state.dialCode,
						itemStyle: theme.pickerItem,
						onValueChange: dialCode => {
							this.setState({ dialCode }, () => {
								this.onChangeText();
							});
						}
					},
					countryDialCodes.map(dialCode => React.createElement(Picker.Item, { key: dialCode, value: dialCode, label: dialCode }))
				),
				React.createElement(TextInput, _extends({
					style: theme.phoneInput,
					autoCapitalize: 'none',
					autoCorrect: false,
					placeholderTextColor: placeholderColor
				}, this.props, {
					value: phoneValue,
					onChangeText: phone => {
						this.setState({ phone }, () => {
							this.onChangeText();
						});
					}
				}))
			)
		);
	}
}

export const SectionFooter = props => {
	const theme = props.theme || AmplifyTheme;
	return React.createElement(
		View,
		{ style: theme.sectionFooter },
		React.createElement(
			LinkCell,
			{
				theme: theme,
				onPress: () => onStateChange('confirmSignUp'),
				testID: TEST_ID.AUTH.CONFIRM_A_CODE_BUTTON
			},
			I18n.get('Confirm a Code')
		),
		React.createElement(
			LinkCell,
			{
				theme: theme,
				onPress: () => onStateChange('signIn'),
				testID: TEST_ID.AUTH.SIGN_IN_BUTTON
			},
			I18n.get('Sign In')
		)
	);
};

export const LinkCell = props => {
	const { disabled } = props;
	const theme = props.theme || AmplifyTheme;
	return React.createElement(
		View,
		{ style: theme.cell },
		React.createElement(
			TouchableHighlight,
			{
				onPress: props.onPress,
				underlayColor: linkUnderlayColor,
				testID: props.testID,
				disabled: disabled
			},
			React.createElement(
				Text,
				{
					style: disabled ? theme.sectionFooterLinkDisabled : theme.sectionFooterLink
				},
				props.children
			)
		)
	);
};

export const Header = props => {
	const theme = props.theme || AmplifyTheme;
	return React.createElement(
		View,
		{ style: theme.sectionHeader },
		React.createElement(
			Text,
			{ style: theme.sectionHeaderText, testID: props.testID },
			props.children
		)
	);
};

export const ErrorRow = props => {
	const theme = props.theme || AmplifyTheme;
	if (!props.children) return null;
	return React.createElement(
		View,
		{ style: theme.errorRow },
		React.createElement(Icon, { name: 'warning', color: errorIconColor }),
		React.createElement(
			Text,
			{ style: theme.errorRowText, testID: TEST_ID.AUTH.ERROR_ROW_TEXT },
			props.children
		)
	);
};

export const AmplifyButton = props => {
	const theme = props.theme || AmplifyTheme;
	let style = theme.button;
	if (props.disabled) {
		style = theme.buttonDisabled;
	}

	if (props.style) {
		style = [style, props.style];
	}

	return React.createElement(
		TouchableOpacity,
		_extends({}, props, { style: style }),
		React.createElement(
			Text,
			{ style: theme.buttonText },
			props.text
		)
	);
};

export const Wrapper = props => {
	const isWeb = Platform.OS === 'web';
	const WrapperComponent = isWeb ? View : TouchableWithoutFeedback;

	const wrapperProps = {
		style: AmplifyTheme.section,
		accessible: false
	};

	if (!isWeb) {
		wrapperProps.onPress = Keyboard.dismiss;
	}

	return React.createElement(
		WrapperComponent,
		wrapperProps,
		props.children
	);
};

export const SignedOutMessage = props => {
	const theme = props.theme || AmplifyTheme;
	const message = props.signedOutMessage || I18n.get('Please Sign In / Sign Up');
	return React.createElement(
		Text,
		{
			style: theme.signedOutMessage,
			testID: TEST_ID.AUTH.GREETING_SIGNED_OUT_TEXT
		},
		message
	);
};