/**
 * A generic Topcoder Community page, which contains header, footer and content.
 *
 * It shows authentication request if user is not authorized.
 * It redirects to 404 page if community is not found by its id.

 * It renders community page content depend on the pageId
 * There are two kind of pages:
 *    - typical pages like leaderboard and challenges which has same relative url
 *      for all communities, these are kind of reserved pageId
 *    - also there could be pages created by a landing page editor with arbitrary pageId
 *      renderCustomPage() method has to return a page made in the editor
 * It redirects to 404 page if content cannot be rendered by its pageId.
 */

/* global window */

import _ from 'lodash';
import challengeListingActions from 'actions/challenge-listing';
import challengeListingSidebarActions from 'actions/challenge-listing/sidebar';
import config from 'utils/config';
import PT from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from 'actions/tc-communities/meta';
import newsActions from 'actions/tc-communities/news';
import { bindActionCreators } from 'redux';
import standardHeaderActions from 'actions/topcoder_header';
import Header from 'components/tc-communities/Header';
import Footer from 'components/tc-communities/Footer';
import LoadingIndicator from 'components/LoadingIndicator';
import Error404 from 'components/Error404';
import qs from 'qs';
import { BUCKETS } from 'utils/challenge-listing/buckets';

// page content components
import ChallengeListing from 'containers/challenge-listing/Listing';
import Leaderboard from 'containers/Leaderboard';
import WiproHome from 'components/tc-communities/communities/wipro/Home';
import WiproFooter from 'components/tc-communities/communities/wipro/Footer';
import WiproLearn from 'components/tc-communities/communities/wipro/Learn';

import QaHome from 'components/tc-communities/communities/qa/Home';
import QaLearn from 'components/tc-communities/communities/qa/Learn';

import SrmxHome from 'components/tc-communities/communities/srmx/Home';
import SrmxLearn from 'components/tc-communities/communities/srmx/Learn';

import TcProdDevHome from 'components/tc-communities/communities/tc-prod-dev/Home';
import TcProdDevLearn from 'components/tc-communities/communities/tc-prod-dev/Learn';

import DemoExpertHome from 'components/tc-communities/communities/demo-expert/Home';
import DemoExpertLearn from 'components/tc-communities/communities/demo-expert/Learn';

import Community2Home from 'components/tc-communities/communities/community-2/Home';
import Community2Learn from 'components/tc-communities/communities/community-2/Learn';

import TaskforceHome from 'components/tc-communities/communities/taskforce/Home';

import AccessDenied, {
  CAUSE as ACCESS_DENIED_CAUSE,
} from 'components/tc-communities/AccessDenied';

import './style.scss';

export class Page extends Component {
  componentDidMount() {
    const communityId = this.props.communityId;
    if ((communityId !== this.props.meta.communityId)
    && !this.props.meta.loading) this.props.loadMetaData(communityId);

    if (this.props.meta.isMobileOpen) this.props.mobileToggle();

    if (this.props.meta.newsFeed && !this.props.news && !this.props.loadingNews) {
      this.props.loadNews(this.props.meta.newsFeed);
    }

    if (!this.props.profile && (communityId === 'wipro')) {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.replace(
        `${config.URL.AUTH}/sso-login/?retUrl=${returnUrl}`);
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.meta.communityId === this.props.communityId
    && nextProps.meta.newsFeed && !this.props.news) {
      nextProps.loadNews(nextProps.meta.newsFeed);
    }
  }

  /**
   * Returns custom page content which is created by landing page editor
   *
   * TODO: as editor is not implemented yet, this method returns static
   *       mock pages. It has to be rewritten when landing page editor is available
   */
  renderCustomPage() {
    let pageContent;
    const communityId = this.props.meta.communityId;
    const pageId = this.props.pageId;

    // as for now landing page editor is not implemented yet
    // for Wipro and Wipro 2 communities we return static pages
    // TODO: this have to be removed when editor implemented
    if (communityId === 'wipro') {
      if (pageId === 'home') {
        pageContent = <WiproHome resetChallengeListing={this.props.resetChallengeListing} />;
      } else if (pageId === 'learn') {
        pageContent = <WiproLearn />;
      }
    } else if (communityId === 'community-2') {
      switch (pageId) {
        case 'home': pageContent = <Community2Home />; break;
        case 'learn': pageContent = <Community2Learn />; break;
        default: break;
      }
    } else if (communityId === 'qa') {
      switch (pageId) {
        case 'home': pageContent = <QaHome />; break;
        case 'learn': pageContent = <QaLearn />; break;
        default: break;
      }
    } else if (communityId === 'srmx') {
      switch (pageId) {
        case 'home': pageContent = <SrmxHome />; break;
        case 'learn': pageContent = <SrmxLearn />; break;
        default: break;
      }
    } else if (communityId === 'tc-prod-dev') {
      switch (pageId) {
        case 'home': pageContent = <TcProdDevHome />; break;
        case 'learn': pageContent = <TcProdDevLearn />; break;
        default: break;
      }
    } else if (communityId === 'demo-expert') {
      switch (pageId) {
        case 'home': pageContent = <DemoExpertHome />; break;
        case 'learn': pageContent = <DemoExpertLearn />; break;
        default: break;
      }
    } else if (communityId === 'taskforce') {
      switch (pageId) {
        case 'home': pageContent = <TaskforceHome />; break;
        default: break;
      }
    } else if (communityId.match(/example-theme-\w/)) {
      pageContent = <div />;
    }

    // if page it not found redirect to 404
    if (!pageContent) {
      pageContent = <Error404 />;
      // pageContent = <Redirect to={{ pathname: '/404' }} />;
    }

    pageContent = React.cloneElement(pageContent, {
      news: this.props.news,
    });

    return pageContent;
  }

  /**
   * Returns community page content depend on the pageId
   * There are two kind of pages:
   *   - typical pages like leaderboard and challenges which has same relative url
   *     for all challenges, these are kind of reserved pageId
   *   - also there could be pages created by a landing page editor with arbitrary pageId
   *     renderCustomPage() method has to return a page made in the editor
   */
  renderPageContent() {
    const pageId = this.props.pageId;
    let pageContent = <div />;
    switch (pageId) {
      case 'leaderboard':
        pageContent = (<Leaderboard
          apiUrl={this.props.meta.leaderboardApiUrl}
        />);
        break;
      case 'challenges': {
        const query = this.props.location.search ?
          qs.parse(this.props.location.search.slice(1)) : null;

        const currencyFromUrl = _.get(query, 'currency');
        const prizeMode = currencyFromUrl ? `money-${currencyFromUrl}`
          : _.get(this.props.meta, 'challengeListing.prizeMode');

        pageContent = (<ChallengeListing
          groupId={this.props.meta.groupId}
          communityId={_.has(query, 'communityId') ? query.communityId : this.props.meta.communityId}
          communityName={this.props.meta.communityName}
          tag={this.props.meta.challengeFilterTag}
          history={this.props.history}
          hideTcLinksInSidebarFooter={this.props.meta.communityId === 'wipro'}
          location={this.props.location}
          openChallengesInNewTabs={
            _.get(this.props.meta, 'challengeListing.openChallengesInNewTabs')
          }
          prizeMode={prizeMode}
        />);
        break;
      }
      default:
        pageContent = this.renderCustomPage();
        break;
    }

    return pageContent;
  }

  render() {
    const communityId = this.props.communityId;

    // true, if is loading now, or if not started loading yet
    const isNotLoaded = communityId !== this.props.meta.communityId;

    if ((this.props.profile || !this.props.meta.authorizedGroupIds) && !isNotLoaded) {
      const userGroupIds = this.props.profile ? this.props.profile.groups.map(item => item.id) : [];
      if (!this.props.meta.authorizedGroupIds ||
      _.intersection(userGroupIds, this.props.meta.authorizedGroupIds || []).length) {
        return (
          <div>
            <Header
              activeTrigger={this.props.activeTrigger}
              closeMenu={this.props.closeMenu}
              logos={this.props.meta.logos}
              additionalLogos={this.props.meta.additionalLogos}
              hideSearch={this.props.meta.hideSearch}
              chevronOverAvatar={this.props.meta.chevronOverAvatar}
              pageId={this.props.pageId}
              profile={this.props.profile}
              menuItems={this.props.meta.menuItems}
              openedMenu={this.props.openedMenu}
              openMenu={this.props.openMenu}
              isMobileOpen={this.props.meta.isMobileOpen}
              communityId={communityId}
              communitySelector={this.props.meta.communitySelector}
              onMobileToggleClick={this.props.mobileToggle}
              cssUrl={this.props.meta.cssUrl}
            />
            {this.renderPageContent()}
            {
              this.props.meta.communityId === 'wipro' ?
                <WiproFooter text={this.props.meta.footerText} /> :
                <Footer
                  menuItems={this.props.meta.menuItems}
                  communityId={communityId}
                  isAuthorized={!!this.props.profile}
                />
            }
          </div>
        );
      }
      return <AccessDenied cause={ACCESS_DENIED_CAUSE.NOT_AUTHORIZED} />;
    } else if (this.props.authenticating || isNotLoaded || communityId === 'wipro') {
      return (
        <div styleName="loading">
          <LoadingIndicator />
        </div>
      );
    }
    return <AccessDenied cause={ACCESS_DENIED_CAUSE.NOT_AUTHENTICATED} />;
  }
}

Page.defaultProps = {
  activeTrigger: null,
  openedMenu: null,
  profile: null,
  isMobileOpen: false,
  loadingNews: false,
  news: null,
};

Page.propTypes = {
  authenticating: PT.bool.isRequired,
  activeTrigger: PT.shape({}),
  closeMenu: PT.func.isRequired,
  communityId: PT.string.isRequired,
  profile: PT.shape({
    groups: PT.arrayOf(PT.shape({
      id: PT.string.isRequired,
    })),
  }),
  meta: PT.shape({
    authorizedGroupIds: PT.arrayOf(PT.string),
    challengeFilterTag: PT.string,
    groupId: PT.string,
    challengeListing: PT.shape({
      openChallengesInNewTabs: PT.bool,
      prizeMode: PT.string,
    }),
    communityId: PT.string,
    communityName: PT.string,
    communitySelector: PT.arrayOf(PT.shape()),
    cssUrl: PT.string,

    // TODO: isMobileOpen does not belong to community meta data, should be
    // moved to a proper place!
    isMobileOpen: PT.bool,

    leaderboardApiUrl: PT.string,
    loading: PT.bool,
    logos: PT.arrayOf(PT.oneOfType([
      PT.string,
      PT.shape({
        img: PT.string.isRequired,
        url: PT.string,
      }),
    ])),
    additionalLogos: PT.arrayOf(PT.string),
    stats: PT.shape(),
    hideSearch: PT.bool,
    chevronOverAvatar: PT.bool,
    footerText: PT.string,
    menuItems: PT.arrayOf(PT.shape({})).isRequired,
    newsFeed: PT.string,
  }).isRequired,
  loadingNews: PT.bool,
  news: PT.arrayOf(PT.shape),
  openedMenu: PT.shape({}),
  openMenu: PT.func.isRequired,
  loadMetaData: PT.func.isRequired,
  loadNews: PT.func.isRequired,
  mobileToggle: PT.func.isRequired,
  pageId: PT.string.isRequired,
  history: PT.shape().isRequired,
  location: PT.shape().isRequired,
  resetChallengeListing: PT.func.isRequired,
};

const mapStateToProps = (state, props) => ({
  ...state.auth,
  ...state.topcoderHeader,
  meta: state.tcCommunities.meta,
  loadingNews: state.tcCommunities.news.loading,
  news: state.tcCommunities.news.data,
  profile: state.auth ? state.auth.profile : null,
  communityId: props.communityId || props.match.params.communityId,
  pageId: props.pageId || props.match.params.pageId,
});

const mapDispatchToProps = dispatch => _.merge(
  bindActionCreators(standardHeaderActions.topcoderHeader, dispatch), {
    loadMetaData: (communityId) => {
      dispatch(newsActions.tcCommunities.news.drop());
      dispatch(actions.tcCommunities.meta.fetchDataInit());
      dispatch(actions.tcCommunities.meta.fetchDataDone(communityId));
    },
    loadNews: (url) => {
      dispatch(newsActions.tcCommunities.news.getNewsInit());
      dispatch(newsActions.tcCommunities.news.getNewsDone(url));
    },
    mobileToggle: () => {
      dispatch(actions.tcCommunities.meta.mobileToggle());
    },
    resetChallengeListing: () => {
      const a = challengeListingActions.challengeListing;
      const sa = challengeListingSidebarActions.challengeListing.sidebar;
      dispatch(a.selectCommunity(''));
      dispatch(a.setFilter({}));
      dispatch(sa.selectBucket(BUCKETS.ALL));
    },
  });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Page);
