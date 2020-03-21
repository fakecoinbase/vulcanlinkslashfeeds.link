/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';

import {
    AppAside,
    AppFooter,
    AppHeader,
    AppSidebar,
    AppSidebarFooter,
    AppSidebarForm,
    AppSidebarHeader,
    AppSidebarMinimizer,
    AppBreadcrumb2 as AppBreadcrumb,
    AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import defaultNavigation from '../../_nav';
// routes config
import routes from '../../routes';
import { connect } from "react-redux"

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {
    constructor(props) {
        super(props);
    }

    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    signOut(e) {
        e.preventDefault();
        this.props.history.push('/login');
    }

    compo

    render() {
        //Custom
        const navigation = JSON.parse(JSON.stringify(defaultNavigation));
        const customContractsNav = (this.props.customContracts || []).map(contract => {
            return ({
                name: contract.name,
                url: `/aggregator/${contract.address}`,
                icon: 'icon-speedometer'
            })
        })
        navigation.items[navigation.items.length - 1].children.push(...customContractsNav)

        return (
            <div className="app">
                <AppHeader fixed>
                    <Suspense fallback={this.loading()}>
                        <DefaultHeader onLogout={e => this.signOut(e)} />
                    </Suspense>
                </AppHeader>
                <div className="app-body">
                    <AppSidebar fixed display="lg">
                        <AppSidebarHeader />
                        <AppSidebarForm />
                        <Suspense>
                            <AppSidebarNav navConfig={navigation} {...this.props} router={router} />
                        </Suspense>
                        <AppSidebarFooter />
                        <AppSidebarMinimizer />
                    </AppSidebar>
                    <main className="main">
                        <AppBreadcrumb appRoutes={routes} router={router} />
                        <Container fluid>
                            <Suspense fallback={this.loading()}>
                                <Switch>
                                    {routes.map((route, idx) => {
                                        return route.component ? (
                                            <Route
                                                key={idx}
                                                path={route.path}
                                                exact={route.exact}
                                                name={route.name}
                                                render={props => <route.component {...props} />}
                                            />
                                        ) : null;
                                    })}
                                    <Redirect from="/" to="/aggregator" />
                                    <Redirect from="/dashboard" to="/aggregator" />
                                </Switch>
                            </Suspense>
                        </Container>
                    </main>
                    <AppAside fixed>
                        <Suspense fallback={this.loading()}>
                            <DefaultAside />
                        </Suspense>
                    </AppAside>
                </div>
                <AppFooter>
                    <Suspense fallback={this.loading()}>
                        <DefaultFooter />
                    </Suspense>
                </AppFooter>
            </div>
        );
    }
}


function mapStateToProps(state) {
    const { persisted } = state
    return { customContracts: persisted.customContracts }
}

export default connect(mapStateToProps)(DefaultLayout);
