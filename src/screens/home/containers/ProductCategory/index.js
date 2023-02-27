import React from 'react';
import {compose} from 'recompose';
import {withTranslation} from 'react-i18next';
import {withNavigation} from '@react-navigation/compat';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import isEqual from 'lodash/isEqual';

import {StyleSheet} from 'react-native';
import Container from 'src/containers/Container';
import Heading from 'src/containers/Heading';
import Products from '../Products';

import {
  currencySelector,
  daysBeforeNewProductSelector,
  defaultCurrencySelector,
  languageSelector,
} from 'src/modules/common/selectors';

import {getProducts} from 'src/modules/product/service';

import {prepareProductItem} from 'src/utils/product';

import {mainStack} from 'src/config/navigator';

const initHeader = {
  style: {},
};

const valueLimit = fields => {
  if (!fields) {
    return 4;
  }
  const count =
    fields.limit && parseInt(fields.limit, 10) ? parseInt(fields.limit, 10) : 4;
  return !count || !count < 0 ? 4 : count;
};

class ProductCategory extends React.Component {
  constructor(props) {
    super(props);
    const category_id =
      props.fields && props.fields.category_id ? props.fields.category_id : '';
    const per_page = valueLimit(props.fields);

    this.state = {
      data: [],
      loading: false,
      category_id,
      per_page,
    };
  }

  componentDidMount() {
    // this.fetchData();
    if (this.props.fields) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.fields, this.props.fields)) {
      const category_id =
        this.props.fields && this.props.fields.category_id
          ? this.props.fields.category_id
          : '';
      const per_page = valueLimit(this.props.fields);
      this.loadingData(per_page, category_id);
    }
  }
  loadingData = (per_page, category_id) => {
    this.setState(
      {
        per_page,
        category_id,
      },
      () => this.fetchData(category_id, per_page),
    );
  };

  fetchData = (
    category_id = this.state.category_id,
    per_page = this.state.per_page,
  ) => {
    const {language} = this.props;

    this.setState(
      {
        loading: true,
      },
      async () => {
        try {
          const query = {
            lang: language,
            status: 'publish',
            category: category_id,
            per_page,
          };
          // eslint-disable-next-line no-undef
          this.abortController = new AbortController();
          const data = await getProducts(query, {
            signal: this.abortController.signal,
          });
          this.setState({
            data,
            loading: false,
          });
        } catch (error) {
          this.setState({
            loading: false,
          });
        }
      },
    );
  };
  /**
   * Prepare product item to render on FlatList
   * @param item
   * @returns {*}
   */
  prepareProduct = item => {
    const {currency, defaultCurrency, days} = this.props;
    const mapItem = Map(item);
    const result = prepareProductItem(mapItem, currency, defaultCurrency, days);
    return result.toJS();
  };
  render() {
    const {
      navigation,
      navigationType,
      headingElement,
      layout,
      fields,
      widthComponent,
      language,
      t,
    } = this.props;
    const {data, per_page, loading, category_id} = this.state;

    if (
      !fields ||
      typeof fields !== 'object' ||
      Object.keys(fields).length < 1
    ) {
      return null;
    }

    const heading = fields.text_heading ? fields.text_heading : initHeader;

    const listData = data.map(this.prepareProduct);

    const headerDisable = !fields.boxed ? 'all' : 'none';

    return (
      <>
        {headingElement ||
          (fields.disable_heading && (
            <Container disable={headerDisable}>
              {headingElement ? (
                headingElement
              ) : (
                <Heading
                  title={
                    heading.text && heading.text[language]
                      ? heading.text[language]
                      : t('common:text_product')
                  }
                  style={heading.style}
                  containerStyle={styles.header}
                  onPress={() =>
                    navigation.navigate(mainStack.products, {
                      name: heading.text[language],
                      id: category_id,
                    })
                  }
                  subTitle={t('common:text_show_all')}
                />
              )}
            </Container>
          ))}
        <Products
          data={listData}
          layout={layout}
          fields={fields}
          widthComponent={widthComponent}
          navigationType={navigationType}
          limit={per_page}
          loading={loading}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 0,
  },
});

ProductCategory.defaultProps = {
  headingElement: null,
  // layout: productListLayout.slide,
};

const mapStateToProps = state => ({
  currency: currencySelector(state),
  defaultCurrency: defaultCurrencySelector(state),
  language: languageSelector(state),
  days: daysBeforeNewProductSelector(state),
});

export default compose(
  withTranslation(),
  withNavigation,
  connect(mapStateToProps),
)(ProductCategory);
