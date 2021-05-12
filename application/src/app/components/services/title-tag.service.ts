import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MetaTag } from '../../globals'

@Injectable({
  providedIn: 'root'
})
export class TitleTagService {

  private description = "description";
  private titleMeta = "og:title";
  private descriptionMeta = "og:description";
  private twitterTitleMeta = "twitter:title";
  private twitterDescMeta = "twitter:description";

  constructor(private titleService: Title, private metaService: Meta) { }

  public setTitle(title: string): void {
    this.titleService.setTitle(title);
  }

  public setSocialMediaTags(title: string, description: string): void {
    const tags = [
      new MetaTag(this.description, description, false),
      new MetaTag(this.titleMeta, title, true),
      new MetaTag(this.descriptionMeta, description, true),
      new MetaTag(this.twitterTitleMeta, title, false),
      new MetaTag(this.twitterDescMeta, description, false),
    ];
    this.setTags(tags);
  }

  private setTags(tags: MetaTag[]): void {
    tags.forEach(siteTag => {
      const tag = siteTag.isFacebook ?  this.metaService.getTag(`property='${siteTag.name}'`) : this.metaService.getTag(`name='${siteTag.name}'`);
      if (siteTag.isFacebook) {
        this.metaService.updateTag({ property: siteTag.name, content: siteTag.value });
      } else {
        this.metaService.updateTag({ name: siteTag.name, content: siteTag.value });
      }
    });
  }
}