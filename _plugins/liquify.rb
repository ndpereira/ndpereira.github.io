module Liquify
  def liquify(str)
    str = "#{str}".gsub(/!\[(.*)\]\(([^\)]+)\)(?:{:([^}]+)})*/, '{% include picture.html src="\2" alt="\1" \3 %}')
    str = Liquid::Template.parse(str).render(@context)
    Kramdown::Document.new(str).to_html
  end
end

Liquid::Template.register_filter(Liquify)