/* global interfaceConfig */

import React from "react";

import { isMobileBrowser } from "../../base/environment/utils";
import { translate, translateToHTML } from "../../base/i18n";
import { Icon, IconWarning } from "../../base/icons";
import { Watermarks } from "../../base/react";
import { connect } from "../../base/redux";
import { CalendarList } from "../../calendar-sync";
import { RecentList } from "../../recent-list";
import { SettingsButton, SETTINGS_TABS } from "../../settings";

import { AbstractWelcomePage, _mapStateToProps } from "./AbstractWelcomePage";
import Tabs from "./Tabs";

/**
 * The pattern used to validate room name.
 * @type {string}
 */
export const ROOM_NAME_VALIDATE_PATTERN_STR = "^[^?&:\u0022\u0027%#]+$";

/**
 * The Web container rendering the welcome page.
 *
 * @extends AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage {
    /**
     * Default values for {@code WelcomePage} component's properties.
     *
     * @static
     */
    static defaultProps = {
        _room: "",
    };

    /**
     * Initializes a new WelcomePage instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,

            generateRoomnames:
                interfaceConfig.GENERATE_ROOMNAMES_ON_WELCOME_PAGE,
            selectedTab: 0,
        };

        /**
         * The HTML Element used as the container for additional content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentRef = null;

        this._roomInputRef = null;

        /**
         * The HTML Element used as the container for additional toolbar content. Used
         * for directly appending the additional content template to the dom.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentRef = null;

        this._additionalCardRef = null;

        /**
         * The template to use as the additional card displayed near the main one.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalCardTemplate = document.getElementById(
            "welcome-page-additional-card-template"
        );

        /**
         * The template to use as the main content for the welcome page. If
         * not found then only the welcome page head will display.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentTemplate = document.getElementById(
            "welcome-page-additional-content-template"
        );

        /**
         * The template to use as the additional content for the welcome page header toolbar.
         * If not found then only the settings icon will be displayed.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalToolbarContentTemplate = document.getElementById(
            "settings-toolbar-additional-content-template"
        );

        // Bind event handlers so they are only bound once per instance.
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onRoomChange = this._onRoomChange.bind(this);
        this._setAdditionalCardRef = this._setAdditionalCardRef.bind(this);
        this._setAdditionalContentRef =
            this._setAdditionalContentRef.bind(this);
        this._setRoomInputRef = this._setRoomInputRef.bind(this);
        this._setAdditionalToolbarContentRef =
            this._setAdditionalToolbarContentRef.bind(this);
        this._onTabSelected = this._onTabSelected.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        super.componentDidMount();

        document.body.classList.add("welcome-page");
        document.title = interfaceConfig.APP_NAME;

        if (this.state.generateRoomnames) {
            this._updateRoomname();
        }

        if (this._shouldShowAdditionalContent()) {
            this._additionalContentRef.appendChild(
                this._additionalContentTemplate.content.cloneNode(true)
            );
        }

        if (this._shouldShowAdditionalToolbarContent()) {
            this._additionalToolbarContentRef.appendChild(
                this._additionalToolbarContentTemplate.content.cloneNode(true)
            );
        }

        if (this._shouldShowAdditionalCard()) {
            this._additionalCardRef.appendChild(
                this._additionalCardTemplate.content.cloneNode(true)
            );
        }
    }

    /**
     * Removes the classname used for custom styling of the welcome page.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        super.componentWillUnmount();

        document.body.classList.remove("welcome-page");
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */
    render() {
        const { _moderatedRoomServiceUrl, t } = this.props;
        const { DEFAULT_WELCOME_PAGE_LOGO_URL, DISPLAY_WELCOME_FOOTER } =
            interfaceConfig;
        const showAdditionalCard = this._shouldShowAdditionalCard();
        const showAdditionalContent = this._shouldShowAdditionalContent();
        const showAdditionalToolbarContent =
            this._shouldShowAdditionalToolbarContent();
        const contentClassName = showAdditionalContent
            ? "with-content"
            : "without-content";
        const footerClassName = DISPLAY_WELCOME_FOOTER
            ? "with-footer"
            : "without-footer";

        return (
            <div className="mx-auto overflow-hidden">
                <div className="flex flex-col md:flex-row bg-dark-blue w-full h-full">
                    <div className="flex flex-col items-center p-6 w-full min-h-screen justify-center">
                        <h2 className="w-80 text-base text-center">
                            Maintaining physical <br />
                            connections virtually with no <br />
                            dull moment
                        </h2>
                        <img
                            src="/assets/img/tric=vho.png"
                            className="w-full max-w-lg py-8"
                            alt=""
                        />
                        <p className="text-xs text-center">
                            Trivoh Mobile App Download our App <br />
                            to start a meeting anywhere and everywhere
                        </p>
                        <div className="flex flex-wrap justify-around">
                            <a href="#" className="m-3">
                                <img
                                    src="./assets/img/app-store-badge.png"
                                    alt=""
                                />
                            </a>
                            <a href="#" className="m-3">
                                <img
                                    src="./assets/img/google-play-badge.png"
                                    alt=""
                                />
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col p-6 bg-gray-100 w-full min-h-screen items-center justify-center">
                        <img
                            src="./assets/img/trivohlogo.png"
                            className="w-48"
                            alt=""
                        />
                        <form
                            className="w-full md:max-w-sm"
                            onSubmit={this._onFormSubmit}
                        >
                            <div className="w-full py-2 text-lg font-semibold text-center rounded mb-3 bg-gray-600 text-gray-100">
                                Join Meeting
                            </div>
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-full p-3 text-lg font-semibold my-3 border-gray-300 outline-none rounded bg-white text-gray-600"
                            />
                            <input
                                type="text"
                                aria-disabled="false"
                                aria-label="Meeting name input"
                                autoFocus={true}
                                // className="enter-room-input"
                                id="enter_room_field"
                                onChange={this._onRoomChange}
                                pattern={ROOM_NAME_VALIDATE_PATTERN_STR}
                                placeholder={this.state.roomPlaceholder}
                                ref={this._setRoomInputRef}
                                placeholder="Meeting ID"
                                value={this.state.room}
                                className="w-full p-3 text-lg font-semibold my-3 border-gray-300 outline-none rounded bg-white text-gray-600"
                            />
                            <button
                                aria-disabled="false"
                                aria-label="Start meeting"
                                // className="welcome-page-button"
                                id="enter_room_button"
                                onClick={this._onFormSubmit}
                                tabIndex="0"
                                type="button"
                                className="w-full py-2 text-lg font-bold text-center rounded-full my-3 bg-trivoh text-yellow-100"
                            >
                                Join Now
                            </button>
                            <div className="text-center my-5">
                                <a href="login.html">Sign In</a> |{" "}
                                <a href="signup.html">Sign Up</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Renders the insecure room name warning.
     *
     * @inheritdoc
     */
    _doRenderInsecureRoomNameWarning() {
        return (
            <div className="insecure-room-name-warning">
                <Icon src={IconWarning} />
                <span>{this.props.t("security.insecureRoomNameWarning")}</span>
            </div>
        );
    }

    /**
     * Prevents submission of the form and delegates join logic.
     *
     * @param {Event} event - The HTML Event which details the form submission.
     * @private
     * @returns {void}
     */
    _onFormSubmit(event) {
        event.preventDefault();

        if (!this._roomInputRef || this._roomInputRef.reportValidity()) {
            this._onJoin();
        }
    }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    _onRoomChange(event) {
        super._onRoomChange(event.target.value);
    }

    /**
     * Callback invoked when the desired tab to display should be changed.
     *
     * @param {number} tabIndex - The index of the tab within the array of
     * displayed tabs.
     * @private
     * @returns {void}
     */
    _onTabSelected(tabIndex) {
        this.setState({ selectedTab: tabIndex });
    }

    /**
     * Renders the footer.
     *
     * @returns {ReactElement}
     */
    _renderFooter() {
        const { t } = this.props;
        const {
            MOBILE_DOWNLOAD_LINK_ANDROID,
            MOBILE_DOWNLOAD_LINK_F_DROID,
            MOBILE_DOWNLOAD_LINK_IOS,
        } = interfaceConfig;

        return (
            <footer className="welcome-footer">
                <div className="welcome-footer-centered">
                    <div className="welcome-footer-padded">
                        <div className="welcome-footer-row-block welcome-footer--row-1">
                            <div className="welcome-footer-row-1-text">
                                {t("welcomepage.jitsiOnMobile")}
                            </div>
                            <a
                                className="welcome-badge"
                                href={MOBILE_DOWNLOAD_LINK_IOS}
                            >
                                <img
                                    alt={t("welcomepage.mobileDownLoadLinkIos")}
                                    src="./images/app-store-badge.png"
                                />
                            </a>
                            <a
                                className="welcome-badge"
                                href={MOBILE_DOWNLOAD_LINK_ANDROID}
                            >
                                <img
                                    alt={t(
                                        "welcomepage.mobileDownLoadLinkAndroid"
                                    )}
                                    src="./images/google-play-badge.png"
                                />
                            </a>
                            <a
                                className="welcome-badge"
                                href={MOBILE_DOWNLOAD_LINK_F_DROID}
                            >
                                <img
                                    alt={t(
                                        "welcomepage.mobileDownLoadLinkFDroid"
                                    )}
                                    src="./images/f-droid-badge.png"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    /**
     * Renders tabs to show previous meetings and upcoming calendar events. The
     * tabs are purposefully hidden on mobile browsers.
     *
     * @returns {ReactElement|null}
     */
    _renderTabs() {
        if (isMobileBrowser()) {
            return null;
        }

        const { _calendarEnabled, _recentListEnabled, t } = this.props;

        const tabs = [];

        if (_calendarEnabled) {
            tabs.push({
                label: t("welcomepage.calendar"),
                content: <CalendarList />,
            });
        }

        if (_recentListEnabled) {
            tabs.push({
                label: t("welcomepage.recentList"),
                content: <RecentList />,
            });
        }

        if (tabs.length === 0) {
            return null;
        }

        return (
            <Tabs
                onSelect={this._onTabSelected}
                selected={this.state.selectedTab}
                tabs={tabs}
            />
        );
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * additional card shown near the tabs card.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalCardRef(el) {
        this._additionalCardRef = el;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * welcome page content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalContentRef(el) {
        this._additionalContentRef = el;
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * toolbar additional content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the additional toolbar content.
     * @private
     * @returns {void}
     */
    _setAdditionalToolbarContentRef(el) {
        this._additionalToolbarContentRef = el;
    }

    /**
     * Sets the internal reference to the HTMLInputElement used to hold the
     * welcome page input room element.
     *
     * @param {HTMLInputElement} el - The HTMLElement for the input of the room name on the welcome page.
     * @private
     * @returns {void}
     */
    _setRoomInputRef(el) {
        this._roomInputRef = el;
    }

    /**
     * Returns whether or not an additional card should be displayed near the tabs.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalCard() {
        return (
            interfaceConfig.DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD &&
            this._additionalCardTemplate &&
            this._additionalCardTemplate.content &&
            this._additionalCardTemplate.innerHTML.trim()
        );
    }

    /**
     * Returns whether or not additional content should be displayed below
     * the welcome page's header for entering a room name.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalContent() {
        return (
            interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT &&
            this._additionalContentTemplate &&
            this._additionalContentTemplate.content &&
            this._additionalContentTemplate.innerHTML.trim()
        );
    }

    /**
     * Returns whether or not additional content should be displayed inside
     * the header toolbar.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalToolbarContent() {
        return (
            interfaceConfig.DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT &&
            this._additionalToolbarContentTemplate &&
            this._additionalToolbarContentTemplate.content &&
            this._additionalToolbarContentTemplate.innerHTML.trim()
        );
    }
}

export default translate(connect(_mapStateToProps)(WelcomePage));
