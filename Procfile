release: bundle exec rails db:exists db:migrate
web: bundle exec puma -C config/puma.rb
worker: bundle exec good_job start
