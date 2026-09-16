import React from 'react';
import Content from '@theme-original/DocItem/Content';
import Admonition from '@theme/Admonition';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import registry from '@site/verification.json';

/**
 * Renders a verification banner above every doc.
 *
 * The default is deliberate: a page absent from verification.json renders as
 * unverified. Forgetting to register a page fails safe - it looks untested,
 * rather than looking like nothing at all.
 */
export default function ContentWrapper(props) {
  const {metadata} = useDoc();
  const entry = registry[metadata.id] ?? {};

  if (entry.exempt) {
    return <Content {...props} />;
  }

  const banner = entry.verified ? (
    <Admonition type="tip" title="Verified against an org">
      <p>
        Samples on this page were deployed and run
        {entry.org ? ` in a ${entry.org} org` : ''}
        {entry.apiVersion ? ` on API version ${entry.apiVersion}` : ''}
        {entry.date ? `, last checked ${entry.date}` : ''}.
      </p>
      {entry.notes && <p>{entry.notes}</p>}
    </Admonition>
  ) : (
    <Admonition type="warning" title="Not yet verified">
      <p>
        Samples on this page are derived from official documentation and have
        not been run against a live org. Treat them as a starting point rather
        than as tested code.
      </p>
      {entry.notes && <p>{entry.notes}</p>}
    </Admonition>
  );

  return (
    <>
      {banner}
      <Content {...props} />
    </>
  );
}
