# encoding:utf-8

#load librarys
require 'active_record'
require 'sinatra/base'
require 'em-websocket'
require 'socket'


#db config
ActiveRecord::Base.establish_connection(
	:adapter=>"sqlite3",
	:database=>"basestation.sqlite3"
)

#load local rb
Dir['model/*'].each { |lib| require_relative lib }
Dir['lib/*'].each { |lib| require_relative lib }

#BaseStation source
$bsip = '127.0.0.1'
$bsport = 30003